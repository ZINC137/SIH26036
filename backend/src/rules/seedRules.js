const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { demoPortals } = require('../config/demoPortals');
const {
  CENTRAL_GATC_NOTIFICATION,
  CENTRAL_GATC_SOURCE,
  GENERAL_RULES_SOURCE,
  COMMON_DOCUMENTS,
  COMMON_CHECKLIST,
  CATEGORIES_DATA,
} = require('./categoriesData');

const prisma = new PrismaClient();

async function upsertProfile(tx, userId, portal) {
  if (portal.role === 'user') {
    await tx.userProfile.upsert({
      where: { user_id: userId },
      update: portal.profile,
      create: { user_id: userId, ...portal.profile },
    });
    return;
  }

  const profileModel = {
    lmo: 'lmoProfile',
    field_officer: 'fieldOfficerProfile',
    gatc: 'gatcProfile',
    admin: 'adminProfile',
  }[portal.role];

  await tx[profileModel].upsert({
    where: { user_id: userId },
    update: portal.profile,
    create: { user_id: userId, ...portal.profile },
  });
}

async function seedDemoUsers(tx) {
  for (const portal of demoPortals) {
    const password_hash = await argon2.hash(portal.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    const user = await tx.user.upsert({
      where: { email: portal.email },
      update: {
        password_hash,
        role: portal.role,
        status: 'ACTIVE',
        is_verified: true,
        failed_login_attempts: 0,
        lockout_until: null,
      },
      create: {
        email: portal.email,
        password_hash,
        role: portal.role,
        status: 'ACTIVE',
        is_verified: true,
      },
    });

    await upsertProfile(tx, user.id, portal);
  }
}

async function seedRules() {
  console.log('🏛️ Initializing Legal Metrology Rule Configuration & Authority Eligibility Layer...');

  try {
    const existingCount = await prisma.instrumentCategory.count();
    if (existingCount >= 27) {
      console.log(`✅ Legal Metrology Rules already configured in database (${existingCount} categories active). Skipping redundant seeding.`);
      return;
    }
  } catch (checkErr) {
    console.warn('Could not check existing categories, proceeding with seed:', checkErr.message);
  }

  for (const cat of CATEGORIES_DATA) {
    // 1. Upsert InstrumentCategory
    const categoryRecord = await prisma.instrumentCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        description: cat.description,
        parent_category: cat.parent_category,
        units: JSON.stringify(cat.units),
        is_gatc_eligible: cat.is_gatc_eligible,
        applicable_authorities: cat.applicable_authorities,
        field_schema: JSON.stringify(cat.field_schema),
        source_document: cat.source_document,
        source_rule: cat.source_rule,
        source_notification: cat.source_notification,
        active: true,
      },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        parent_category: cat.parent_category,
        units: JSON.stringify(cat.units),
        is_gatc_eligible: cat.is_gatc_eligible,
        applicable_authorities: cat.applicable_authorities,
        field_schema: JSON.stringify(cat.field_schema),
        source_document: cat.source_document,
        source_rule: cat.source_rule,
        source_notification: cat.source_notification,
        active: true,
      },
    });

    // 2. Active RuleSet Version 1
    const ruleSetCode = `RS_${cat.code}`;
    const existingRuleSet = await prisma.ruleSet.findFirst({
      where: { code: ruleSetCode, version: 1 },
    });

    if (!existingRuleSet) {
      await prisma.ruleSet.create({
        data: {
          code: ruleSetCode,
          name: `Standard Verification Rule Set for ${cat.name}`,
          jurisdiction: cat.jurisdiction_type || 'CENTRAL',
          state_code: cat.state_code || null,
          instrument_category_id: categoryRecord.id,
          verification_type: 'ALL',
          version: 1,
          source_document: cat.source_document || GENERAL_RULES_SOURCE,
          source_reference: cat.source_rule || 'General Rules Schedule',
          source_notification: cat.source_notification || CENTRAL_GATC_NOTIFICATION,
          effective_from: new Date('2011-04-01'),
          effective_to: null,
          status: 'ACTIVE',
          priority: 1,
          notes: 'Standard gazetted verification rule set.',
        },
      });
    }

    // Statutory Requirement: Future Rule for Active Electrical Energy Meters (G.S.R. 809(E))
    // Published in Gazette on 18 September 2026; comes into force 180 days after publication (17 March 2027)
    if (cat.code === 'ENERGY_METER') {
      const gazettePublicationDate = new Date('2026-09-18T00:00:00.000Z');
      const statutoryCommencementDate = new Date(gazettePublicationDate.getTime() + (180 * 24 * 60 * 60 * 1000)); // Exactly 2027-03-17T00:00:00.000Z
      
      const existingFutureRule = await prisma.ruleSet.findFirst({
        where: { code: ruleSetCode, version: 2 },
      });
      if (!existingFutureRule) {
        await prisma.ruleSet.create({
          data: {
            code: ruleSetCode,
            name: 'Legal Metrology (General) Fifth Amendment Rules, 2026 for Active Electrical Energy Meters',
            jurisdiction: 'CENTRAL',
            instrument_category_id: categoryRecord.id,
            verification_type: 'ALL',
            version: 2,
            source_document: 'Legal Metrology (General) Fifth Amendment Rules, 2026',
            source_reference: 'Schedule VII - Active Electrical Energy Meters Requirements',
            source_notification: 'G.S.R. 809(E) dated 18-09-2026 (Commencement 180 days: 17-03-2027)',
            effective_from: statutoryCommencementDate,
            effective_to: null,
            status: 'SCHEDULED', // SCHEDULED/FUTURE STATUS (Requirement 23)
            priority: 2,
            notes: 'Statutory commencement 180 days after Official Gazette publication on 18-09-2026 under G.S.R. 809(E). Becomes active automatically on 17-03-2027.',
          },
        });
        console.log('   ⏰ Seeded SCHEDULED future rule version 2 for ENERGY_METER (effective 17 March 2027 under G.S.R. 809(E)).');
      } else {
        await prisma.ruleSet.update({
          where: { id: existingFutureRule.id },
          data: {
            source_notification: 'G.S.R. 809(E) dated 18-09-2026 (Commencement 180 days: 17-03-2027)',
            effective_from: statutoryCommencementDate,
            status: 'SCHEDULED',
            notes: 'Statutory commencement 180 days after Official Gazette publication on 18-09-2026 under G.S.R. 809(E). Becomes active automatically on 17-03-2027.',
          },
        });
      }
    }

    // 3. Authority Eligibility Configuration
    // LMO is always allowed for all categories
    const existingLmoEligibility = await prisma.authorityEligibility.findFirst({
      where: {
        instrument_category_id: categoryRecord.id,
        authority_type: 'LMO',
        jurisdiction_type: cat.jurisdiction_type || 'CENTRAL',
      },
    });
    if (!existingLmoEligibility) {
      await prisma.authorityEligibility.create({
        data: {
          instrument_category_id: categoryRecord.id,
          authority_type: 'LMO',
          jurisdiction_type: cat.jurisdiction_type || 'CENTRAL',
          state_code: cat.state_code || null,
          verification_type: 'ALL',
          allowed: true,
          priority: 1,
          source_document: 'Legal Metrology Act, 2009',
          source_rule: 'Section 24',
          effective_from: new Date('2011-04-01'),
          notes: 'Statutory verification authority vested in gazetted Legal Metrology Officers.',
          active: true,
        },
      });
    }

    // GATC eligibility depends on whether category is in GATC First Schedule
    const existingGatcEligibility = await prisma.authorityEligibility.findFirst({
      where: {
        instrument_category_id: categoryRecord.id,
        authority_type: 'GATC',
        jurisdiction_type: cat.jurisdiction_type || 'CENTRAL',
      },
    });
    if (!existingGatcEligibility) {
      await prisma.authorityEligibility.create({
        data: {
          instrument_category_id: categoryRecord.id,
          authority_type: 'GATC',
          jurisdiction_type: cat.jurisdiction_type || 'CENTRAL',
          state_code: cat.state_code || null,
          verification_type: 'ALL',
          allowed: cat.is_gatc_eligible,
          priority: 2,
          source_document: cat.source_document || CENTRAL_GATC_SOURCE,
          source_rule: cat.source_rule || 'First Schedule',
          source_notification: cat.source_notification || CENTRAL_GATC_NOTIFICATION,
          effective_from: new Date('2025-10-23'),
          notes: cat.is_gatc_eligible
            ? 'Permitted for laboratory testing by Government Approved Test Centres under Rule 3(1).'
            : 'NOT eligible for GATC under current central First Schedule; reserved exclusively for LMO.',
          active: true,
        },
      });
    }

    // 4. Validity Rule Configuration
    const existingValidity = await prisma.validityRule.findFirst({
      where: { instrument_category_id: categoryRecord.id },
    });
    if (!existingValidity && cat.validity) {
      await prisma.validityRule.create({
        data: {
          instrument_category_id: categoryRecord.id,
          verification_type: 'ALL',
          initial_verification_period: cat.validity.initial_verification_period,
          subsequent_verification_period: cat.validity.subsequent_verification_period,
          period_unit: cat.validity.period_unit || 'MONTHS',
          repair_reverification_behaviour: 'MANDATORY_FULL_TEST',
          installation_reverification_behaviour: 'ON_SITE_CALIBRATION',
          source_document: cat.validity.source_document || GENERAL_RULES_SOURCE,
          source_rule: cat.validity.source_rule || 'Rule 27',
          effective_from: new Date('2011-04-01'),
          active: true,
        },
      });
    }

    // 5. Test Definitions (Authoritative Only)
    if (Array.isArray(cat.tests)) {
      for (let i = 0; i < cat.tests.length; i++) {
        const t = cat.tests[i];
        const existingTest = await prisma.testDefinition.findFirst({
          where: {
            instrument_category_id: categoryRecord.id,
            test_code: t.test_code,
          },
        });
        if (!existingTest) {
          await prisma.testDefinition.create({
            data: {
              instrument_category_id: categoryRecord.id,
              test_code: t.test_code,
              test_name: t.test_name,
              description: t.description,
              verification_type: 'ALL',
              sequence: i + 1,
              units: t.units || '',
              formula: t.formula || '',
              calculation_method: t.calculation_method || 'ERROR_PERCENTAGE',
              max_permissible_error: t.max_permissible_error !== undefined ? t.max_permissible_error : null,
              mpe_rule_text: t.description,
              mandatory: t.mandatory !== false,
              source_document: t.source_document || GENERAL_RULES_SOURCE,
              source_rule: t.source_rule || 'Schedule VII',
              effective_from: new Date('2011-04-01'),
              active: true,
            },
          });
        }
      }
    }

    // 6. Common & Category Document Requirements
    for (const d of COMMON_DOCUMENTS) {
      const existingDoc = await prisma.documentRequirement.findFirst({
        where: {
          instrument_category_id: categoryRecord.id,
          document_code: d.document_code,
        },
      });
      if (!existingDoc) {
        await prisma.documentRequirement.create({
          data: {
            instrument_category_id: categoryRecord.id,
            verification_type: 'ALL',
            document_code: d.document_code,
            name: d.name,
            mandatory: d.mandatory,
            source_document: GENERAL_RULES_SOURCE,
            source_rule: 'Application Guidelines',
            active: true,
          },
        });
      }
    }

    // 7. Common Statutory Verification Checklist
    for (let j = 0; j < COMMON_CHECKLIST.length; j++) {
      const c = COMMON_CHECKLIST[j];
      const existingCheck = await prisma.verificationChecklistItem.findFirst({
        where: {
          instrument_category_id: categoryRecord.id,
          check_code: c.check_code,
        },
      });
      if (!existingCheck) {
        await prisma.verificationChecklistItem.create({
          data: {
            instrument_category_id: categoryRecord.id,
            check_code: c.check_code,
            check_name: c.check_name,
            sequence: j + 1,
            mandatory: c.mandatory,
            source_document: GENERAL_RULES_SOURCE,
            active: true,
          },
        });
      }
    }
  }

  // Provision initial portal accounts (Admin, LMO, GATC, Field Officer, Citizen)
  await seedDemoUsers(prisma);

  const categoryCount = await prisma.instrumentCategory.count();
  const ruleSetCount = await prisma.ruleSet.count();
  const authorityCount = await prisma.authorityEligibility.count();
  const testCount = await prisma.testDefinition.count();
  const validityCount = await prisma.validityRule.count();
  const userCount = await prisma.user.count();

  console.log(`✅ Legal Metrology Rule Configuration & Portal Accounts seeded successfully!`);
  console.log(`   - Portal Users Configured: ${userCount}`);
  console.log(`   - Instrument Categories: ${categoryCount}`);
  console.log(`   - Rule Sets Configured: ${ruleSetCount}`);
  console.log(`   - Authority Eligibility Records: ${authorityCount}`);
  console.log(`   - Statutory Test Definitions: ${testCount}`);
  console.log(`   - Validity / Re-verification Rules: ${validityCount}`);
}

module.exports = { seedRules };

if (require.main === module) {
  seedRules()
    .catch((err) => {
      console.error('Seed rules failure:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
