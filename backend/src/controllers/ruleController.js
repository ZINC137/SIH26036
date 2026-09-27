const { PrismaClient } = require('@prisma/client');
const {
  determineEligibleAuthorities,
  getCategorySchema,
  calculateValidityDates,
  calculateTestResult,
  createNewRuleVersion,
} = require('../services/ruleEngineService');

const prisma = new PrismaClient();

// 1. GET /api/rules/categories - Public & Portal category list
const getCategories = async (req, res) => {
  try {
    const { search, parentCategory, gatcOnly } = req.query;

    const where = { active: true };
    if (parentCategory && parentCategory !== 'ALL') {
      where.parent_category = parentCategory;
    }
    if (gatcOnly === 'true') {
      where.is_gatc_eligible = true;
    }

    const categories = await prisma.instrumentCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        parent_category: true,
        units: true,
        is_gatc_eligible: true,
        applicable_authorities: true,
        source_document: true,
        source_rule: true,
        source_notification: true,
      },
    });

    let filtered = categories;
    if (search) {
      const q = search.toLowerCase();
      filtered = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    const formatted = filtered.map((c) => {
      let units = ['kg'];
      try {
        if (c.units) units = JSON.parse(c.units);
      } catch (e) {}
      return {
        ...c,
        units,
      };
    });

    return res.status(200).json({ categories: formatted });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to retrieve instrument categories.' });
  }
};

// 2. GET /api/rules/applicable - Category-specific dynamic schema and authority options
const getApplicableRules = async (req, res) => {
  try {
    const { categoryCode, state, verificationType } = req.query;

    if (!categoryCode) {
      return res.status(400).json({ error: 'categoryCode parameter is required.' });
    }

    const schema = await getCategorySchema(
      categoryCode,
      state || 'Delhi',
      verificationType || 'INITIAL_VERIFICATION'
    );

    if (!schema) {
      return res.status(404).json({ error: `Category "${categoryCode}" not found.` });
    }

    return res.status(200).json(schema);
  } catch (error) {
    console.error('Get applicable rules error:', error);
    return res.status(500).json({ error: 'Failed to retrieve applicable rule schema.' });
  }
};

// 3. GET /api/rules/eligibility - Real-time routing eligibility evaluation
const checkEligibility = async (req, res) => {
  try {
    const { categoryCode, state, district, verificationType, preferredRoute, capacity, unit } = req.query;

    if (!categoryCode) {
      return res.status(400).json({ error: 'categoryCode is required.' });
    }

    const eligibility = await determineEligibleAuthorities({
      categoryCode,
      state: state || 'Delhi',
      district: district || 'North Delhi',
      verificationType: verificationType || 'INITIAL_VERIFICATION',
      preferredRoute: preferredRoute || 'NO_PREFERENCE',
      capacity,
      unit,
    });

    return res.status(200).json({
      ...eligibility,
      eligibility,
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    return res.status(500).json({ error: 'Failed to evaluate authority eligibility.' });
  }
};

// 4. POST /api/rules/calculate-test - Authoritative test calculation
const performTestCalculation = async (req, res) => {
  try {
    const { categoryCode, testCode, referenceValue, observedValue, indicatedValue } = req.body;

    if (!testCode || referenceValue === undefined) {
      return res.status(400).json({ error: 'testCode and referenceValue are required.' });
    }

    const result = await calculateTestResult({
      categoryCode,
      testCode,
      referenceValue,
      observedValue,
      indicatedValue,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Test calculation error:', error);
    return res.status(500).json({ error: 'Failed to perform authoritative test calculation.' });
  }
};

// 5. GET /api/rules/admin/rulesets - Admin rule sets & versions view
const getAdminRuleSets = async (req, res) => {
  try {
    const ruleSets = await prisma.ruleSet.findMany({
      include: {
        instrument_category: {
          select: { code: true, name: true, is_gatc_eligible: true },
        },
      },
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
    });

    return res.status(200).json({ ruleSets });
  } catch (error) {
    console.error('Get admin rulesets error:', error);
    return res.status(500).json({ error: 'Failed to load rule sets.' });
  }
};

// 6. POST /api/rules/admin/rulesets/:id/version - Create new RuleSet version
const createVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceDocument, sourceReference, sourceNotification, effectiveFrom, notes } = req.body;

    const newVersion = await createNewRuleVersion({
      ruleSetId: id,
      sourceDocument,
      sourceReference,
      sourceNotification,
      effectiveFrom,
      notes,
      actorEmail: req.user?.email || 'admin@gov.in',
    });

    return res.status(201).json({
      message: `RuleSet updated to version ${newVersion.version} successfully. Historical version preserved as SUPERSEDED.`,
      newVersion,
    });
  } catch (error) {
    console.error('Create rule version error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create new rule version.' });
  }
};

// 7. GET /api/rules/admin/matrix - GATC Authority Matrix overview
const getAuthorityMatrix = async (req, res) => {
  try {
    const categories = await prisma.instrumentCategory.findMany({
      where: { active: true },
      include: {
        authority_eligibilities: true,
        validity_rules: true,
        test_definitions: true,
      },
      orderBy: { name: 'asc' },
    });

    const matrix = categories.map((cat) => {
      const gatcElig = cat.authority_eligibilities.find((a) => a.authority_type === 'GATC');
      const lmoElig = cat.authority_eligibilities.find((a) => a.authority_type === 'LMO');
      const val = cat.validity_rules[0];

      return {
        code: cat.code,
        name: cat.name,
        parentCategory: cat.parent_category,
        isGatcEligible: cat.is_gatc_eligible,
        lmoAllowed: lmoElig ? lmoElig.allowed : true,
        gatcAllowed: gatcElig ? gatcElig.allowed : false,
        sourceDocument: cat.source_document,
        sourceRule: cat.source_rule,
        sourceNotification: cat.source_notification,
        validityPeriod: val ? `${val.initial_verification_period} / ${val.subsequent_verification_period} ${val.period_unit}` : '12 MONTHS',
        testsCount: cat.test_definitions.length,
      };
    });

    return res.status(200).json({ matrix });
  } catch (error) {
    console.error('Get authority matrix error:', error);
    return res.status(500).json({ error: 'Failed to load authority matrix.' });
  }
};

module.exports = {
  getCategories,
  getApplicableRules,
  checkEligibility,
  performTestCalculation,
  getAdminRuleSets,
  createVersion,
  getAuthorityMatrix,
};
