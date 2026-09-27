const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeStateCode(state) {
  if (!state) return '';
  const s = state.trim().toUpperCase();
  const map = {
    'MAHARASHTRA': 'MH',
    'MH': 'MH',
    'DELHI': 'DL',
    'DL': 'DL',
    'GUJARAT': 'GJ',
    'GJ': 'GJ',
    'KARNATAKA': 'KA',
    'KA': 'KA',
    'TAMIL NADU': 'TN',
    'TN': 'TN',
    'UTTAR PRADESH': 'UP',
    'UP': 'UP',
    'WEST BENGAL': 'WB',
    'WB': 'WB',
  };
  return map[s] || s;
}

const LEGACY_CATEGORY_MAP = {
  'Platform Balance (50kg - 500kg)': 'NAWI_CLASS_III_150KG',
  'Platform Balance': 'NAWI_CLASS_III_150KG',
  'Electronic Weighing Scale': 'NAWI_CLASS_III_150KG',
  'Weighing Scale (Capacity <= 5kg)': 'NAWI_CLASS_III_150KG',
  'Weighing Scale (5kg - 50kg)': 'NAWI_CLASS_III_150KG',
  'Weighing Scale': 'NAWI_CLASS_III_150KG',
  'Electronic Weighing Machine': 'NAWI_CLASS_III_150KG',
  'Tabletop Scale': 'NAWI_CLASS_III_150KG',
  'Bench Scale': 'NAWI_CLASS_III_150KG',
  'Non-Automatic Weighing Instrument': 'NAWI_CLASS_III_150KG',
  'Crane Scale': 'NAWI_CLASS_III_OVER_150KG',
  'Counter Scale': 'COUNTER_MACHINE',
  'Beam Scale': 'BEAM_SCALE',
  'Weights': 'WEIGHTS_ALL',
  'Standard Weights': 'WEIGHTS_ALL',
  'Weights — All Categories': 'WEIGHTS_ALL',
  'Water Meter': 'WATER_METER',
  'Gas Meter': 'GAS_METER',
  'Flow Meter': 'FLOW_METER',
  'Energy Meter': 'ENERGY_METER',
  'Petrol Dispenser': 'PETROL_DIESEL_DISPENSER',
  'Diesel Dispenser': 'PETROL_DIESEL_DISPENSER',
  'Petrol/Diesel Dispenser': 'PETROL_DIESEL_DISPENSER',
  'CNG Dispenser': 'CNG_DISPENSER',
  'LPG Dispenser': 'LPG_DISPENSER',
  'LNG Dispenser': 'LNG_DISPENSER',
  'Hydrogen Dispenser': 'HYDROGEN_DISPENSER',
  'Weighbridge (10T - 100T)': 'AUTOMATIC_RAIL_WEIGHBRIDGE',
  'Weighbridge': 'AUTOMATIC_RAIL_WEIGHBRIDGE',
  'BULK_MILK_CHILLER_FLOW': 'STATE_MILK_METER',
};

function parseCapacityInKg(capacity, unit) {
  if (capacity === undefined || capacity === null || capacity === '') return null;
  const num = parseFloat(String(capacity).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return null;
  const u = (unit || '').toLowerCase().trim();
  if (u === 'g' || u === 'gram' || u === 'grams') return num / 1000;
  if (u === 'mg') return num / 1000000;
  if (u === 't' || u === 'tonne' || u === 'ton' || u === 'tonnes') return num * 1000;
  return num;
}

/**
 * Resolve category by code, legacy alias, or descriptive name, with capacity weight evaluation
 */
async function resolveCategory(categoryCodeOrName, capacity, unit) {
  if (!categoryCodeOrName) return null;
  const trimmed = categoryCodeOrName.trim();

  // 1. Direct code lookup
  let cat = await prisma.instrumentCategory.findUnique({
    where: { code: trimmed },
    include: {
      authority_eligibilities: { where: { active: true } },
      validity_rules: { where: { active: true } },
    },
  });

  // 2. Legacy alias mapping if not direct match
  if (!cat) {
    const mappedCode = LEGACY_CATEGORY_MAP[trimmed];
    if (mappedCode) {
      cat = await prisma.instrumentCategory.findUnique({
        where: { code: mappedCode },
        include: {
          authority_eligibilities: { where: { active: true } },
          validity_rules: { where: { active: true } },
        },
      });
    }
  }

  // 3. Match by name exact or contains
  if (!cat) {
    cat = await prisma.instrumentCategory.findFirst({
      where: {
        OR: [
          { name: { equals: trimmed } },
          { name: { contains: trimmed } },
        ],
      },
      include: {
        authority_eligibilities: { where: { active: true } },
        validity_rules: { where: { active: true } },
      },
    });
  }

  // 4. Specific Weight / Capacity Evaluation (Rule 3(1) and Item 6 of First Schedule)
  // Non-automatic weighing instruments up to 150 kg are GATC-eligible; above 150 kg are LMO-only.
  const capacityInKg = parseCapacityInKg(capacity, unit);
  if (capacityInKg !== null) {
    const isNawiCandidate =
      cat?.code === 'NAWI_CLASS_III_150KG' ||
      cat?.code === 'NAWI_CLASS_III_OVER_150KG' ||
      trimmed.toLowerCase().includes('weigh') ||
      trimmed.toLowerCase().includes('balance') ||
      trimmed.toLowerCase().includes('scale');

    const isNonAdjustable =
      cat?.code === 'WEIGHTS_ALL' ||
      cat?.code === 'AUTOMATIC_RAIL_WEIGHBRIDGE' ||
      cat?.code === 'LOAD_CELL' ||
      cat?.code === 'BEAM_SCALE' ||
      cat?.code === 'COUNTER_MACHINE';

    if (isNawiCandidate && !isNonAdjustable) {
      const targetCode = capacityInKg <= 150 ? 'NAWI_CLASS_III_150KG' : 'NAWI_CLASS_III_OVER_150KG';
      if (!cat || cat.code !== targetCode) {
        const adjustedCat = await prisma.instrumentCategory.findUnique({
          where: { code: targetCode },
          include: {
            authority_eligibilities: { where: { active: true } },
            validity_rules: { where: { active: true } },
          },
        });
        if (adjustedCat) return adjustedCat;
      }
    }
  }

  return cat;
}

/**
 * Determine legally-aware authority eligibility for an application
 * 
 * Rules:
 * Rule A: If category is NOT GATC eligible -> eligibleAuthorityTypes = ["LMO"]
 * Rule B: If category IS GATC eligible -> eligibleAuthorityTypes = ["LMO", "GATC"]
 * Rule C: GATC can only appear when active, authorized for category, geography, capability
 * Rule D: If no eligible GATC exists -> route to LMO
 * Rule E: If both LMO and GATC exist -> do NOT auto-assign; send to allocator
 * Rule F: Applicant preference cannot bypass backend eligibility
 * Rule G: GATC category scope enforced
 * Rule H: Geography & district jurisdiction dynamic
 */
async function determineEligibleAuthorities({
  categoryCode,
  state = 'Delhi',
  district = 'North Delhi',
  verificationType = 'INITIAL_VERIFICATION',
  date = new Date(),
  preferredRoute = 'NO_PREFERENCE',
  capacity,
  unit,
}) {
  const targetDate = date instanceof Date ? date : new Date(date);

  // 1. Lookup Category (with code/alias resolution and capacity weight check)
  const category = await resolveCategory(categoryCode, capacity, unit);

  if (!category) {
    return {
      eligibleAuthorityTypes: ['LMO'],
      eligibleGATCs: [],
      eligibleLMOs: [],
      reason: `Instrument category "${categoryCode}" is not registered in the Legal Metrology database. Defaulting to Legal Metrology Officer.`,
      assignmentRequired: true,
      gatcEligible: false,
      gatcAvailable: false,
      preferredRouteEvaluation: 'LMO fallback due to unregistered category.',
    };
  }

  // 2. Query Authority Eligibility for this Category
  // Check for State-specific override first, then Central
  const stateEligibility = await prisma.authorityEligibility.findFirst({
    where: {
      instrument_category_id: category.id,
      authority_type: 'GATC',
      jurisdiction_type: 'STATE',
      state_code: { in: [state, normalizeStateCode(state), (state || '').toUpperCase()] },
      allowed: true,
      active: true,
      effective_from: { lte: targetDate },
      OR: [{ effective_to: null }, { effective_to: { gte: targetDate } }],
    },
  });

  const centralEligibility = await prisma.authorityEligibility.findFirst({
    where: {
      instrument_category_id: category.id,
      authority_type: 'GATC',
      jurisdiction_type: 'CENTRAL',
      allowed: true,
      active: true,
      effective_from: { lte: targetDate },
      OR: [{ effective_to: null }, { effective_to: { gte: targetDate } }],
    },
  });

  const isGatcLegallyPermitted = Boolean(stateEligibility || centralEligibility);

  // Rule A & B: Determine legally permitted types
  const eligibleAuthorityTypes = isGatcLegallyPermitted ? ['LMO', 'GATC'] : ['LMO'];

  // 3. Find Candidate LMOs in the Jurisdiction
  const candidateLmoUsers = await prisma.user.findMany({
    where: {
      role: 'lmo',
      status: 'ACTIVE',
    },
    include: { lmoProfile: true },
  });

  // Filter LMOs by State/Division
  const eligibleLMOs = candidateLmoUsers
    .filter((u) => {
      if (!u.lmoProfile) return true;
      if (state && u.lmoProfile.state && u.lmoProfile.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }
      return true;
    })
    .map((u) => ({
      id: u.id,
      name: u.lmoProfile?.full_name || u.email,
      employeeCode: u.lmoProfile?.employeeCode || 'LMO-GOV',
      state: u.lmoProfile?.state || state,
      division: u.lmoProfile?.districtDivision || district,
      email: u.email,
      phone: u.lmoProfile?.phone || '',
    }));

  // 4. Find Candidate GATCs if GATC is Legally Permitted
  let eligibleGATCs = [];
  let gatcAvailabilityReason = '';

  if (isGatcLegallyPermitted) {
    const candidateGatcUsers = await prisma.user.findMany({
      where: {
        role: 'gatc',
        status: { in: ['ACTIVE', 'ACCREDITED'] },
      },
      include: { gatcProfile: true },
    });

    eligibleGATCs = candidateGatcUsers
      .filter((u) => {
        const p = u.gatcProfile;
        if (!p) return false;

        // Rule C: Must have active recognition
        if (p.is_active_recognition === false || p.status === 'SUSPENDED') {
          return false;
        }

        // Rule C: Expiry validation
        if (p.valid_until && new Date(p.valid_until) < targetDate) {
          return false;
        }

        // Rule G: Check category authorization scope
        const authorizedCategories = (p.authorized_categories || '')
          .split(',')
          .map((s) => s.trim().toUpperCase());
        const authorizedScopes = (p.authorized_scopes || '').toLowerCase();
        const catUpper = category.code.toUpperCase();
        const inputUpper = (categoryCode || '').toUpperCase();
        const catNameLower = category.name.toLowerCase();

        const isCategoryAuthorized =
          authorizedCategories.includes(catUpper) ||
          authorizedCategories.includes(inputUpper) ||
          authorizedCategories.includes('ALL') ||
          authorizedScopes.includes(catNameLower) ||
          authorizedScopes.includes(inputUpper.toLowerCase()) ||
          (catUpper.includes('WEIGH') && (authorizedScopes.includes('weigh') || authorizedScopes.includes('balance'))) ||
          (catUpper.includes('DISPENSER') && authorizedScopes.includes('dispenser')) ||
          (catUpper.includes('FLOW') && authorizedScopes.includes('flow meter'));

        if (!isCategoryAuthorized) {
          return false;
        }

        // Rule H: Check geographic scope
        if (p.authorized_area_type !== 'NATIONAL') {
          if (p.authorized_state && state && p.authorized_state.toLowerCase() !== state.toLowerCase()) {
            return false;
          }
          if (
            p.authorized_districts &&
            p.authorized_districts !== 'ALL' &&
            district &&
            !p.authorized_districts.toLowerCase().includes(district.toLowerCase())
          ) {
            return false;
          }
        }

        return true;
      })
      .map((u) => ({
        id: u.id,
        name: u.gatcProfile?.centre_name || u.email,
        gatcCode: u.gatcProfile?.gatc_code || 'GATC-LAB',
        accreditationNo: u.gatcProfile?.accreditation_no || '',
        state: u.gatcProfile?.state || state,
        district: u.gatcProfile?.district || district,
        authorizedScopes: u.gatcProfile?.authorized_scopes || '',
        validUntil: u.gatcProfile?.valid_until,
      }));

    if (eligibleGATCs.length === 0) {
      gatcAvailabilityReason =
        'Category is legally GATC-eligible under First Schedule, but no active accredited GATC currently holds operational authorization for this category in the requested jurisdiction.';
    }
  } else {
    gatcAvailabilityReason =
      'Instrument category is not listed in the First Schedule of the Legal Metrology (GATC) Rules, 2013 as amended. Stamping is reserved for gazetted Legal Metrology Officers.';
  }

  // Rule F: Evaluate applicant preference
  let preferredRouteEvaluation = 'No preference submitted.';
  if (preferredRoute === 'GATC') {
    if (!isGatcLegallyPermitted) {
      preferredRouteEvaluation =
        'Applicant requested GATC, but this category is not eligible for GATC under central rules. Authority routed to LMO.';
    } else if (eligibleGATCs.length === 0) {
      preferredRouteEvaluation =
        'Applicant requested GATC, but no accredited GATC is available in this geographical area. Authority routed to LMO.';
    } else {
      preferredRouteEvaluation = 'Applicant preferred GATC. Eligible candidates exist for allocator review.';
    }
  } else if (preferredRoute === 'LMO') {
    preferredRouteEvaluation = 'Applicant preferred LMO. Eligible LMO officers available in jurisdiction.';
  }

  return {
    categoryCode,
    categoryName: category.name,
    eligibleAuthorityTypes,
    eligibleGATCs,
    eligibleLMOs,
    gatcEligible: isGatcLegallyPermitted,
    gatcAvailable: eligibleGATCs.length > 0,
    reason: gatcAvailabilityReason || 'Both Legal Metrology Officer and accredited GATC test centres are legally eligible.',
    assignmentRequired: true,
    preferredRoute,
    preferredRouteEvaluation,
  };
}

/**
 * Get category-specific dynamic schema including fields, documents, checklist, tests, and validity
 */
async function getCategorySchema(categoryCode, stateCode = 'Delhi', verificationType = 'INITIAL_VERIFICATION') {
  const now = new Date();

  const resolved = await resolveCategory(categoryCode);
  if (!resolved) return null;

  const category = await prisma.instrumentCategory.findUnique({
    where: { id: resolved.id },
    include: {
      document_requirements: {
        where: { active: true },
      },
      checklist_items: {
        where: { active: true },
        orderBy: { sequence: 'asc' },
      },
      test_definitions: {
        where: {
          active: true,
          effective_from: { lte: now },
          OR: [{ effective_to: null }, { effective_to: { gte: now } }],
        },
        orderBy: { sequence: 'asc' },
      },
      validity_rules: {
        where: { active: true },
      },
      rule_sets: {
        where: {
          status: 'ACTIVE',
          effective_from: { lte: now },
          OR: [{ effective_to: null }, { effective_to: { gte: now } }],
        },
        orderBy: { version: 'desc' },
      },
    },
  });

  if (!category) return null;

  // Active RuleSet
  const activeRuleSet = category.rule_sets[0] || null;

  // Check GATC eligibility
  const eligibility = await determineEligibleAuthorities({
    categoryCode,
    state: stateCode,
    verificationType,
  });

  // Parse field schema
  let fieldSchema = [];
  try {
    if (category.field_schema) {
      fieldSchema = JSON.parse(category.field_schema);
    }
  } catch (e) {
    fieldSchema = [];
  }

  let units = ['kg'];
  try {
    if (category.units) {
      units = JSON.parse(category.units);
    }
  } catch (e) {
    units = ['kg'];
  }

  const validityRule = category.validity_rules[0] || {
    initial_verification_period: 12,
    subsequent_verification_period: 12,
    period_unit: 'MONTHS',
    source_document: 'Legal Metrology (General) Rules, 2011',
  };

  return {
    category: {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      parentCategory: category.parent_category,
      units,
      isGatcEligible: category.is_gatc_eligible,
      applicableAuthorities: category.applicable_authorities,
      sourceDocument: category.source_document,
      sourceRule: category.source_rule,
      sourceNotification: category.source_notification,
    },
    activeRuleSet: activeRuleSet
      ? {
          id: activeRuleSet.id,
          code: activeRuleSet.code,
          name: activeRuleSet.name,
          version: activeRuleSet.version,
          status: activeRuleSet.status,
          sourceDocument: activeRuleSet.source_document,
          sourceReference: activeRuleSet.source_reference,
          effectiveFrom: activeRuleSet.effective_from,
        }
      : null,
    fieldSchema,
    documents: category.document_requirements.map((d) => ({
      code: d.document_code,
      name: d.name,
      mandatory: d.mandatory,
    })),
    checklist: category.checklist_items.map((c) => ({
      code: c.check_code,
      name: c.check_name,
      mandatory: c.mandatory,
    })),
    tests: category.test_definitions.map((t) => ({
      code: t.test_code,
      name: t.test_name,
      description: t.description,
      units: t.units,
      formula: t.formula,
      calculationMethod: t.calculation_method,
      maxPermissibleError: t.max_permissible_error,
      mandatory: t.mandatory,
      sourceRule: t.source_rule,
    })),
    validityRule: {
      initialPeriod: validityRule.initial_verification_period,
      subsequentPeriod: validityRule.subsequent_verification_period,
      unit: validityRule.period_unit,
      sourceDocument: validityRule.source_document,
      sourceRule: validityRule.source_rule,
    },
    eligibility,
  };
}

/**
 * Calculate statutory verification validity dates
 * (Supports 2025 volumetric meter insertion & category-specific periods)
 */
async function calculateValidityDates(categoryCodeOrOptions, verificationDate = new Date(), verificationType = 'INITIAL_VERIFICATION') {
  let catCode = categoryCodeOrOptions;
  let vDate = verificationDate;
  let vType = verificationType;

  if (typeof categoryCodeOrOptions === 'object' && categoryCodeOrOptions !== null) {
    catCode = categoryCodeOrOptions.categoryCode;
    vDate = categoryCodeOrOptions.verificationDate || new Date();
    vType = categoryCodeOrOptions.verificationType || 'INITIAL_VERIFICATION';
  }

  const targetDate = vDate instanceof Date ? vDate : new Date(vDate);
  const resolved = await resolveCategory(catCode);
  if (!resolved) {
    const validUntil = new Date(targetDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    return {
      validFrom: targetDate,
      validUntil: validUntil,
      nextDueDate: validUntil,
      periodMonths: 12,
    };
  }

  const category = await prisma.instrumentCategory.findUnique({
    where: { id: resolved.id },
    include: { validity_rules: { where: { active: true } } },
  });

  const validityRule = category?.validity_rules?.[0];
  const isInitial = vType === 'INITIAL_VERIFICATION' || vType === 'INITIAL';

  const periodMonths = validityRule
    ? isInitial
      ? validityRule.initial_verification_period
      : validityRule.subsequent_verification_period
    : 12;

  const validUntil = new Date(targetDate);
  validUntil.setMonth(validUntil.getMonth() + periodMonths);

  const nextDueDate = new Date(validUntil);
  nextDueDate.setDate(nextDueDate.getDate() - 30); // 30 days renewal alert window

  return {
    validFrom: targetDate,
    validUntil: validUntil,
    nextDueDate: nextDueDate,
    periodMonths,
    ruleSource: validityRule?.source_document || 'Legal Metrology (General) Rules, 2011',
    ruleReference: validityRule?.source_rule || 'Rule 27',
  };
}

/**
 * Calculate test result authoritative on backend
 * Raw measurement is never overwritten; result derived by backend
 */
async function calculateTestResult({
  categoryCode,
  testCode,
  testDefinition,
  referenceValue,
  observedValue,
  indicatedValue,
}) {
  const testDef =
    testDefinition ||
    (await prisma.testDefinition.findFirst({
      where: {
        test_code: testCode,
        active: true,
      },
    }));

  if (!testDef) {
    return {
      result: 'MANUAL_RULE_REVIEW_REQUIRED',
      calculatedError: null,
      calculatedPercentageError: null,
      maximumPermissibleError: null,
      message: `No active official test definition for test code ${testCode}. Requires manual review.`,
    };
  }

  const ref = parseFloat(referenceValue);
  const obs = parseFloat(observedValue !== undefined ? observedValue : indicatedValue);

  if (isNaN(ref) || isNaN(obs)) {
    return {
      result: 'FAIL',
      calculatedError: null,
      calculatedPercentageError: null,
      maximumPermissibleError: testDef.max_permissible_error,
      message: 'Invalid numerical measurement input.',
    };
  }

  const method = testDef.calculation_method || 'ERROR_PERCENTAGE';
  const mpe = testDef.max_permissible_error !== null ? testDef.max_permissible_error : 0.05;

  let calculatedError = 0;
  let calculatedPercentageError = 0;
  let pass = false;

  if (method === 'ERROR_PERCENTAGE') {
    if (ref === 0) {
      calculatedError = obs;
      calculatedPercentageError = 0;
      pass = Math.abs(obs) <= mpe;
    } else {
      calculatedError = obs - ref;
      calculatedPercentageError = ((obs - ref) / ref) * 100;
      pass = Math.abs(calculatedPercentageError) <= mpe;
    }
  } else if (method === 'DIFFERENCE') {
    calculatedError = Math.abs(obs - ref);
    calculatedPercentageError = ref > 0 ? (calculatedError / ref) * 100 : 0;
    pass = calculatedError <= mpe;
  } else if (method === 'MPE_BOUNDS') {
    calculatedError = obs;
    calculatedPercentageError = null;
    pass = obs <= mpe;
  } else if (method === 'MANUAL_RULE_REVIEW_REQUIRED') {
    return {
      result: 'MANUAL_RULE_REVIEW_REQUIRED',
      calculatedError: obs - ref,
      maximumPermissibleError: mpe,
      message: 'Statutory test configured for manual rule review.',
    };
  }

  return {
    testCode: testDef.test_code,
    testName: testDef.test_name,
    result: pass ? 'PASS' : 'FAIL',
    calculatedError: parseFloat(calculatedError.toFixed(4)),
    calculatedPercentageError: calculatedPercentageError !== null ? parseFloat(calculatedPercentageError.toFixed(4)) : null,
    maximumPermissibleError: mpe,
    units: testDef.units,
    formula: testDef.formula,
  };
}

/**
 * Create immutable frozen rule snapshot for newly submitted application
 */
async function createRuleSnapshot(categoryCode, stateCode = 'Delhi', verificationType = 'INITIAL_VERIFICATION') {
  const schema = await getCategorySchema(categoryCode, stateCode, verificationType);
  if (!schema) {
    return {
      ruleSetId: null,
      ruleVersion: 1,
      authorityEligibilityVersion: 'GATC_SCHEDULE_2026',
      ruleSnapshot: null,
      legacyRuleSnapshot: false,
      eligibleAuthorityTypes: 'LMO',
    };
  }

  const snapshotData = {
    categoryCode: schema.category.code,
    categoryName: schema.category.name,
    ruleSetId: schema.activeRuleSet?.id,
    ruleVersion: schema.activeRuleSet?.version || 1,
    sourceDocument: schema.category.sourceDocument,
    sourceRule: schema.category.sourceRule,
    sourceNotification: schema.category.sourceNotification,
    isGatcEligible: schema.category.isGatcEligible,
    eligibleAuthorityTypes: schema.eligibility.eligibleAuthorityTypes,
    validityRule: schema.validityRule,
    documents: schema.documents,
    checklist: schema.checklist,
    tests: schema.tests,
    snapshotDate: new Date().toISOString(),
  };

  return {
    ruleSetId: schema.activeRuleSet?.id || null,
    ruleVersion: schema.activeRuleSet?.version || 1,
    authorityEligibilityVersion: 'GATC_SCHEDULE_2026',
    ruleSnapshot: JSON.stringify(snapshotData),
    legacyRuleSnapshot: false,
    eligibleAuthorityTypes: schema.eligibility.eligibleAuthorityTypes.join(','),
  };
}

/**
 * Validate authority assignment against legal rules and operational scope
 */
async function validateAuthorityAssignment({ application, assigneeType, targetId }) {
  if (application.legacy_rule_snapshot) {
    // Section 37: For legacy applications, preserve existing behavior
    if (assigneeType === 'GATC') {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        include: { gatcProfile: true },
      });
      if (!targetUser || targetUser.role !== 'gatc') {
        throw new Error('Selected GATC test centre was not found.');
      }
    }
    return true;
  }

  const categoryCode = application.selected_category_code || application.instrument_type;

  // 1. Determine legal eligibility (including weight capacity verification)
  const eligibility = await determineEligibleAuthorities({
    categoryCode,
    state: application.state,
    district: application.city,
    verificationType: application.application_type,
    capacity: application.capacity,
    unit: application.unit,
  });

  if (assigneeType === 'GATC') {
    if (!eligibility.gatcEligible) {
      throw new Error(
        `Statutory Violation: Instrument "${application.instrument_type}" is not eligible for GATC laboratory testing under the First Schedule of Legal Metrology (GATC) Rules, 2013. Only gazetted Legal Metrology Officers are authorized.`
      );
    }

    const matchedGatc = eligibility.eligibleGATCs.find(
      (g) => g.id === targetId || g.gatcCode === targetId
    );
    if (!matchedGatc) {
      // Check if target GATC exists at all by UUID or gatc_code
      let targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        include: { gatcProfile: true },
      });

      if (!targetUser) {
        const prof = await prisma.gatcProfile.findUnique({
          where: { gatc_code: targetId },
          include: { user: true },
        });
        if (prof?.user) {
          targetUser = { ...prof.user, gatcProfile: prof };
        }
      }

      if (!targetUser || targetUser.role !== 'gatc') {
        throw new Error('Selected GATC test centre was not found.');
      }

      throw new Error(
        `Statutory Violation: Centre "${targetUser.gatcProfile?.centre_name || targetUser.email}" is not authorized for category "${categoryCode}" or does not have jurisdiction in ${application.state}.`
      );
    }
  }

  return true;
}

/**
 * Create a new RuleSet version (Rule Set Versioning Architecture)
 * Never overwrites an active historical rule; sets previous to SUPERSEDED and increments version.
 */
async function createNewRuleVersion({
  ruleSetId,
  sourceDocument,
  sourceReference,
  sourceNotification,
  effectiveFrom,
  notes,
  actorEmail,
}) {
  const existing = await prisma.ruleSet.findUnique({ where: { id: ruleSetId } });
  if (!existing) {
    throw new Error('RuleSet not found.');
  }

  const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
  const nextVersion = existing.version + 1;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Mark existing rule as superseded
    await tx.ruleSet.update({
      where: { id: existing.id },
      data: {
        status: 'SUPERSEDED',
        effective_to: effectiveDate,
      },
    });

    // 2. Create next version
    const newVersion = await tx.ruleSet.create({
      data: {
        code: existing.code,
        name: existing.name,
        jurisdiction: existing.jurisdiction,
        state_code: existing.state_code,
        instrument_category_id: existing.instrument_category_id,
        instrument_subcategory_id: existing.instrument_subcategory_id,
        verification_type: existing.verification_type,
        version: nextVersion,
        source_document: sourceDocument || existing.source_document,
        source_reference: sourceReference || existing.source_reference,
        source_notification: sourceNotification || existing.source_notification,
        effective_from: effectiveDate,
        effective_to: null,
        status: effectiveDate > new Date() ? 'SCHEDULED' : 'ACTIVE',
        priority: existing.priority + 1,
        notes: notes || `Created new version ${nextVersion} by ${actorEmail}`,
      },
    });

    // 3. Audit Log
    await tx.auditLog.create({
      data: {
        action: 'RULESET_VERSION_CREATED',
        actor: actorEmail || 'admin@gov.in',
        target: existing.code,
        details: `RuleSet ${existing.code} updated to version ${nextVersion} (Effective from ${effectiveDate.toISOString().split('T')[0]}). Previous version ${existing.version} marked SUPERSEDED.`,
      },
    });

    return newVersion;
  });

  return result;
}

module.exports = {
  determineEligibleAuthorities,
  getCategorySchema,
  calculateValidityDates,
  calculateTestResult,
  createRuleSnapshot,
  validateAuthorityAssignment,
  createNewRuleVersion,
};
