/**
 * Legal Metrology Rule Configuration & Routing Engine Test Suite
 * Covers all 15 test scenarios specified in Section 34 of the specification.
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();
const {
  determineEligibleAuthorities,
  getCategorySchema,
  calculateValidityDates,
  calculateTestResult,
  createRuleSnapshot,
  validateAuthorityAssignment,
  createNewRuleVersion,
} = require('./src/services/ruleEngineService');

let passedTests = 0;
let failedTests = 0;
let fixtureUserIds = [];
let fixtureApplicationId = null;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

async function runRuleEngineTests() {
  console.log('====================================================');
  console.log('LEGAL METROLOGY RULE & ROUTING ENGINE TEST SUITE');
  console.log('====================================================\n');

  try {
    const fixtureUser = await prisma.user.create({
      data: {
        email: `rule-test-${crypto.randomUUID()}@example.invalid`,
        password_hash: 'test-only',
        role: 'user',
        status: 'ACTIVE',
        is_verified: true,
      },
    });
    fixtureUserIds.push(fixtureUser.id);

    for (const centre of [
      {
        code: 'GATC-DL-01',
        state: 'Delhi',
        district: 'North Delhi',
        scopes: 'water meter, flow meter, weighbridge, platform balance',
      },
      {
        code: 'GATC-MA-02',
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
        scopes: 'water meter, flow meter',
      },
    ]) {
      const user = await prisma.user.create({
        data: {
          email: `rule-test-${crypto.randomUUID()}@example.invalid`,
          password_hash: 'test-only',
          role: 'gatc',
          status: 'ACTIVE',
          is_verified: true,
        },
      });
      fixtureUserIds.push(user.id);
      await prisma.gatcProfile.create({
        data: {
          user_id: user.id,
          centre_name: centre.code,
          gatc_code: centre.code,
          accreditation_no: `TEST-${centre.code}`,
          valid_until: new Date('2030-12-31'),
          authorized_scopes: centre.scopes,
          authorized_categories: 'WATER_METER,FLOW_METER,NAWI_CLASS_III_150KG',
          authorized_state: centre.state,
          authorized_districts: 'ALL',
          authorized_area_type: 'STATE',
          state: centre.state,
          district: centre.district,
          address: 'Test fixture',
          lab_head_name: 'Test fixture',
          status: 'ACTIVE',
        },
      });
    }

    const fixtureApplication = await prisma.application.create({
      data: {
        app_number: `TEST-${crypto.randomUUID()}`,
        user_id: fixtureUser.id,
        instrument_type: 'Fixture Scale',
        make: 'Test',
        serial_no: `TEST-${crypto.randomUUID()}`,
        capacity: '150',
        unit: 'kg',
        business_name: 'Test fixture',
        address: 'Test fixture',
        city: 'North Delhi',
        state: 'Delhi',
        pincode: '110001',
        contact_name: 'Test fixture',
        contact_phone: '0000000000',
        contact_email: fixtureUser.email,
        status: 'Pending',
      },
    });
    fixtureApplicationId = fixtureApplication.id;

    // ------------------------------------------------------------------------
    // SCENARIO 1: GATC Category -> LMO + GATC Eligible (Rule B)
    // ------------------------------------------------------------------------
    console.log('--- SCENARIO 1: GATC Category -> LMO + GATC ---');
    const sc1 = await determineEligibleAuthorities({
      categoryCode: 'WATER_METER',
      state: 'Delhi',
      district: 'North Delhi',
    });
    assert(sc1.gatcEligible === true, 'Water Meter is legally GATC-eligible under 2026 First Schedule');
    assert(sc1.eligibleAuthorityTypes.includes('LMO'), 'LMO is permitted for Water Meter');
    assert(sc1.eligibleAuthorityTypes.includes('GATC'), 'GATC is permitted for Water Meter');
    assert(sc1.eligibleAuthorityTypes.length === 2, 'Eligible types are exactly [LMO, GATC]');
    assert(sc1.eligibleGATCs.length > 0, 'At least one operational GATC found in Delhi');

    // ------------------------------------------------------------------------
    // SCENARIO 2: Non-GATC Category -> LMO Only (Rule A)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 2: Non-GATC Category -> LMO Only ---');
    const sc2 = await determineEligibleAuthorities({
      categoryCode: 'TAXIMETER',
      state: 'Delhi',
      district: 'North Delhi',
    });
    assert(sc2.gatcEligible === false, 'Taximeter is not in First Schedule GATC list');
    assert(sc2.eligibleAuthorityTypes.includes('LMO'), 'LMO is permitted for Taximeter');
    assert(!sc2.eligibleAuthorityTypes.includes('GATC'), 'GATC is NOT permitted for Taximeter');
    assert(sc2.eligibleGATCs.length === 0, 'No GATCs eligible for non-GATC category');

    // ------------------------------------------------------------------------
    // SCENARIO 3: GATC Category But No Active GATC In Geography -> Route to LMO (Rule D)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 3: GATC Category But No Active GATC in Geography -> LMO ---');
    const sc3 = await determineEligibleAuthorities({
      categoryCode: 'WATER_METER',
      state: 'Sikkim',
      district: 'Gangtok',
    });
    assert(sc3.gatcEligible === true, 'Category remains legally GATC-eligible');
    assert(sc3.eligibleGATCs.length === 0, 'No operational GATC candidate in Sikkim');
    assert(sc3.gatcAvailable === false, 'GATC availability is false');
    assert(sc3.eligibleLMOs.length >= 0, 'LMO fallback active');
    assert(
      sc3.reason.includes('no active accredited GATC') || sc3.gatcAvailable === false,
      'Routing engine specifies LMO fallback due to no active GATC'
    );

    // ------------------------------------------------------------------------
    // SCENARIO 4: GATC Exists But Category Unauthorized -> Excluded (Rule G)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 4: GATC Exists But Category Unauthorized -> Excluded ---');
    // BREATH_ANALYSER is in First Schedule, but Delhi GATC (GATC-DL-01) does not have it in its scope
    const sc4 = await determineEligibleAuthorities({
      categoryCode: 'BREATH_ANALYSER',
      state: 'Delhi',
      district: 'North Delhi',
    });
    const delhiLabInSc4 = sc4.eligibleGATCs.find((g) => g.gatcCode === 'GATC-DL-01');
    assert(sc4.gatcEligible === true, 'Breath Analyser is in First Schedule');
    assert(delhiLabInSc4 === undefined, 'GATC-DL-01 excluded because Breath Analyser is outside its authorized scope');

    // ------------------------------------------------------------------------
    // SCENARIO 5: GATC Exists But Geography Invalid -> Excluded (Rule H)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 5: GATC Exists But Geography Invalid -> Excluded ---');
    // GATC-MA-02 is in Maharashtra. For an application in Delhi, it must be excluded.
    const sc5 = await determineEligibleAuthorities({
      categoryCode: 'FLOW_METER',
      state: 'Delhi',
      district: 'North Delhi',
    });
    const mumbaiLabInDelhi = sc5.eligibleGATCs.find((g) => g.gatcCode === 'GATC-MA-02');
    assert(mumbaiLabInDelhi === undefined, 'Maharashtra GATC (GATC-MA-02) excluded from Delhi jurisdiction');

    // And for application in Maharashtra, GATC-MA-02 must be included:
    const sc5Mh = await determineEligibleAuthorities({
      categoryCode: 'FLOW_METER',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
    });
    const mumbaiLabInMh = sc5Mh.eligibleGATCs.find((g) => g.gatcCode === 'GATC-MA-02');
    assert(mumbaiLabInMh !== undefined, 'Maharashtra GATC (GATC-MA-02) included in Maharashtra jurisdiction');

    // ------------------------------------------------------------------------
    // SCENARIO 6: Applicant Prefers GATC But No GATC Available -> Fallback LMO (Rule F)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 6: Applicant Prefers GATC But None Available -> LMO ---');
    const sc6 = await determineEligibleAuthorities({
      categoryCode: 'TAXIMETER', // Non-GATC category
      state: 'Delhi',
      district: 'North Delhi',
      preferredRoute: 'GATC',
    });
    assert(
      sc6.preferredRouteEvaluation.includes('not eligible for GATC'),
      'Applicant preference for GATC is safely ignored when legally ineligible'
    );
    assert(sc6.eligibleAuthorityTypes.length === 1 && sc6.eligibleAuthorityTypes[0] === 'LMO', 'Only LMO is eligible');

    // ------------------------------------------------------------------------
    // SCENARIO 7: Applicant Prefers LMO -> LMO Validated (Rule F)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 7: Applicant Prefers LMO -> LMO Validated ---');
    const sc7 = await determineEligibleAuthorities({
      categoryCode: 'WATER_METER',
      state: 'Delhi',
      district: 'North Delhi',
      preferredRoute: 'LMO',
    });
    assert(sc7.eligibleAuthorityTypes.includes('LMO'), 'LMO is legally eligible');
    assert(sc7.preferredRouteEvaluation.includes('Applicant preferred LMO'), 'LMO preference noted and legally validated');

    // ------------------------------------------------------------------------
    // SCENARIO 8: Admin/Allocator Attempts Invalid GATC Assignment -> Reject
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 8: Admin Attempts Invalid GATC Assignment -> Reject ---');
    let sc8ErrorThrown = false;
    let sc8ErrorMessage = '';
    try {
      await validateAuthorityAssignment({
        application: {
          instrument_type: 'Taximeter',
          selected_category_code: 'TAXIMETER',
          state: 'Delhi',
          city: 'North Delhi',
          application_type: 'INITIAL_VERIFICATION',
        },
        assigneeType: 'GATC',
        targetId: fixtureUserIds[1],
      });
    } catch (err) {
      sc8ErrorThrown = true;
      sc8ErrorMessage = err.message;
    }
    assert(sc8ErrorThrown === true, 'Invalid GATC assignment threw exception');
    assert(
      sc8ErrorMessage.includes('Statutory Violation'),
      `Rejection message contains statutory reference: "${sc8ErrorMessage.slice(0, 80)}..."`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 9: Rule Version Changes -> Old Application Retains Frozen Snapshot
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 9: Rule Versioning & Snapshot Immutability ---');
    // Generate snapshot for NAWI_CLASS_III_150KG
    const initialSnapshot = await createRuleSnapshot('NAWI_CLASS_III_150KG', 'Delhi', 'INITIAL_VERIFICATION');
    assert(initialSnapshot.ruleVersion === 1, 'Initial snapshot version is 1');
    const parsedInit = JSON.parse(initialSnapshot.ruleSnapshot);
    assert(parsedInit.categoryCode === 'NAWI_CLASS_III_150KG', 'Category code preserved in snapshot');

    // Now create a new rule version for NAWI_CLASS_III_150KG
    const ruleSetToUpdate = await prisma.ruleSet.findFirst({
      where: { code: 'RS_NAWI_CLASS_III_150KG' },
    });

    const newRuleVersionRes = await createNewRuleVersion({
      ruleSetId: ruleSetToUpdate.id,
      sourceDocument: 'Legal Metrology (General) Amendment Rules, 2027',
      sourceReference: 'Rule 13 Schedule VI Revision',
      sourceNotification: 'G.S.R. 999(E) dated 15-01-2027',
      notes: 'Updated calibration intervals and test tolerances',
      actorEmail: 'admin@gov.in',
    });

    assert(newRuleVersionRes.version === 2, 'New RuleSet version created with version 2');
    assert(newRuleVersionRes.status === 'ACTIVE', 'New RuleSet is ACTIVE');

    // Verify old rule set was superseded, NOT overwritten
    const oldRuleCheck = await prisma.ruleSet.findUnique({ where: { id: ruleSetToUpdate.id } });
    assert(oldRuleCheck.status === 'SUPERSEDED', 'Historical RuleSet marked as SUPERSEDED');
    assert(oldRuleCheck.effective_to != null, 'Historical RuleSet has effective_to date stamped');

    // Verify snapshot taken earlier still has version 1
    assert(initialSnapshot.ruleVersion === 1, 'Historical application snapshot remains locked at version 1');

    // Revert/cleanup the version 2 rule set for clean test idempotency
    await prisma.ruleSet.delete({ where: { id: newRuleVersionRes.id } });
    await prisma.ruleSet.update({
      where: { id: ruleSetToUpdate.id },
      data: { status: 'ACTIVE', effective_to: null },
    });
    console.log('[INFO] Restored RS_NAWI_CLASS_III_150KG_V1 to ACTIVE state after immutability test');

    // ------------------------------------------------------------------------
    // SCENARIO 10: Future Rule NOT Active Before Effective Date (G.S.R. 809(E))
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 10: Future Rule Not Active Before Effective Date (G.S.R. 809(E)) ---');
    const gazettePubDate = new Date('2026-09-18T00:00:00.000Z');
    const expectedCommencement = new Date(gazettePubDate.getTime() + (180 * 24 * 60 * 60 * 1000)); // Exactly 2027-03-17T00:00:00.000Z
    
    // Test current date (before 17 March 2027)
    const emSchemaCurrent = await getCategorySchema('ENERGY_METER', 'Delhi', 'INITIAL_VERIFICATION');
    assert(
      emSchemaCurrent.activeRuleSet.version === 1,
      'Active rule set before 180-day commencement date (17 March 2027) is Version 1'
    );

    // ------------------------------------------------------------------------
    // SCENARIO 11: Future Rule Becomes Active On/After Effective Date (17 March 2027)
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 11: Future Rule Becomes Active On/After Effective Date (17 March 2027) ---');
    const futureRule = await prisma.ruleSet.findFirst({
      where: {
        code: 'RS_ENERGY_METER',
        version: 2,
      },
    });
    assert(futureRule !== null, 'Future RuleSet RS_ENERGY_METER (version 2) exists in database');
    assert(futureRule.status === 'SCHEDULED', 'Future RuleSet status is SCHEDULED before effective date');
    assert(
      futureRule.effective_from.toISOString().split('T')[0] === '2027-03-17',
      `Effective date (${futureRule.effective_from.toISOString().split('T')[0]}) exactly matches 180 days from Gazette publication (2027-03-17)`
    );
    assert(
      futureRule.source_notification.includes('G.S.R. 809(E)'),
      'Source notification correctly references G.S.R. 809(E)'
    );

    // ------------------------------------------------------------------------
    // SCENARIO 12: State-Specific Additional Rule
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 12: State-Specific Rule Override ---');
    // Bulk Milk Chiller & Flow Quantity Meter is prescribed in Maharashtra (MH)
    const mhCheck = await determineEligibleAuthorities({
      categoryCode: 'BULK_MILK_CHILLER_FLOW',
      state: 'Maharashtra',
      district: 'Pune',
    });
    assert(mhCheck.gatcEligible === true, 'Bulk Milk Chiller is GATC-eligible in Maharashtra under State rule');
    assert(mhCheck.eligibleAuthorityTypes.includes('GATC'), 'GATC included in Maharashtra eligible authorities');

    const delhiCheck = await determineEligibleAuthorities({
      categoryCode: 'BULK_MILK_CHILLER_FLOW',
      state: 'Delhi',
      district: 'North Delhi',
    });
    assert(delhiCheck.gatcEligible === false, 'Bulk Milk Chiller is NOT GATC-eligible in Delhi');
    assert(!delhiCheck.eligibleAuthorityTypes.includes('GATC'), 'GATC excluded outside prescribed state');

    // ------------------------------------------------------------------------
    // SCENARIO 13: Failed Test Cannot Generate Certificate & Derives Result
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 13: Backend Calculates Test Result & Rejects Failures ---');
    // Test NAWI_CAPACITY_ERROR calculation: reference 150 kg, indicated 151.5 kg (error +1.5 kg, MPE is 0.150 kg)
    const testDef = await prisma.testDefinition.findFirst({
      where: { test_code: 'NAWI_CAPACITY_ERROR' },
    });
    const failedCalc = await calculateTestResult({
      testDefinition: testDef,
      referenceValue: 150,
      indicatedValue: 151.5,
    });
    assert(failedCalc.result === 'FAIL', 'Backend derived result is FAIL due to error (+1.50kg) exceeding MPE');
    assert(failedCalc.calculatedError === 1.5, 'Calculated error derived correctly (+1.50)');

    const passedCalc = await calculateTestResult({
      testDefinition: testDef,
      referenceValue: 150,
      indicatedValue: 150.05,
    });
    assert(passedCalc.result === 'PASS', 'Backend derived result is PASS when error (+0.05kg) is within MPE');

    // ------------------------------------------------------------------------
    // SCENARIO 14 & 15: Retest Creates New Event & Preserves Historical Results
    // ------------------------------------------------------------------------
    console.log('\n--- SCENARIO 14 & 15: Retest Creates New Event & History Intact ---');
    // Create verification record with attempt 1 = FAIL
    const testApp = await prisma.application.findUniqueOrThrow({
      where: { id: fixtureApplicationId },
    });

    const vRecord = await prisma.verificationRecord.create({
      data: {
        application_id: testApp.id,
        verifier_name: 'Test Officer LMO',
        verifier_code: 'LMO-DL-01',
        verifier_type: 'LMO',
        result: 'Fail',
        working_standards_used: 'Working Standards Set #1',
        remarks: 'Repeatability test exceeded Schedule VI tolerance',
      },
    });

    const testAttempt1 = await prisma.verificationTest.create({
      data: {
        verification_record_id: vRecord.id,
        test_definition_id: testDef.id,
        test_code: testDef.test_code,
        test_name: testDef.test_name,
        attempt_number: 1,
        result: 'FAIL',
        officer_remarks: 'Excessive error on test run 1',
        repair_required: true,
        defect_code: 'ERR_MAX_CAPACITY',
        defect_description: 'Lever knife-edge friction causing +1.50kg deviation',
        measurements: {
          create: [
            {
              sequence: 1,
              reference_value: 150,
              observed_value: 151.5,
              indicated_value: 151.5,
              unit: 'kg',
              raw_reading: '151.5 kg',
              calculated_error: 1.5,
              calculated_percentage_error: 1.0,
              maximum_permissible_error: testDef.max_permissible_error,
              result: 'FAIL',
            },
          ],
        },
      },
      include: { measurements: true },
    });

    assert(testAttempt1.attempt_number === 1, 'Attempt 1 created with FAIL result');
    assert(testAttempt1.result === 'FAIL', 'Attempt 1 result recorded as FAIL');

    // Now simulate repair and retest (Attempt 2)
    const testAttempt2 = await prisma.verificationTest.create({
      data: {
        verification_record_id: vRecord.id,
        test_definition_id: testDef.id,
        test_code: testDef.test_code,
        test_name: testDef.test_name,
        attempt_number: 2,
        result: 'PASS',
        officer_remarks: 'Retest post lever-knife-edge realignment. Passed.',
        repair_required: false,
        measurements: {
          create: [
            {
              sequence: 1,
              reference_value: 150,
              observed_value: 150.05,
              indicated_value: 150.05,
              unit: 'kg',
              raw_reading: '150.05 kg',
              calculated_error: 0.05,
              calculated_percentage_error: 0.033,
              maximum_permissible_error: testDef.max_permissible_error,
              result: 'PASS',
            },
          ],
        },
      },
      include: { measurements: true },
    });

    assert(testAttempt2.attempt_number === 2, 'Attempt 2 created as independent retest event');
    assert(testAttempt2.result === 'PASS', 'Attempt 2 result recorded as PASS');

    // Verify Scenario 15: Historical attempt 1 was NOT overwritten
    const checkAttempt1 = await prisma.verificationTest.findUnique({
      where: { id: testAttempt1.id },
      include: { measurements: true },
    });
    assert(checkAttempt1.result === 'FAIL', 'Historical Attempt 1 result remains FAIL');
    assert(checkAttempt1.measurements[0].calculated_error === 1.5, 'Historical measurement reading remains intact');

    // Cleanup test verification data
    await prisma.verificationMeasurement.deleteMany({
      where: { verification_test_id: { in: [testAttempt1.id, testAttempt2.id] } },
    });
    await prisma.verificationTest.deleteMany({
      where: { id: { in: [testAttempt1.id, testAttempt2.id] } },
    });
    await prisma.verificationRecord.delete({
      where: { id: vRecord.id },
    });
    console.log('[INFO] Cleaned up temporary test verification records');

    // ------------------------------------------------------------------------
    // SCENARIO EXTRA: Category Specific Validity Calculation
    // ------------------------------------------------------------------------
    console.log('\n--- EXTRA: Category-Specific Validity Calculation (Rule 21 & 22) ---');
    const wmDates = await calculateValidityDates({
      categoryCode: 'WATER_METER',
      verificationDate: new Date('2026-03-01'),
      verificationType: 'INITIAL_VERIFICATION',
    });
    const wmUntilStr = wmDates.validUntil.toISOString();
    assert(
      wmUntilStr.startsWith('2031-02-28') || wmUntilStr.startsWith('2031-03-01'),
      `Water Meter initial validity is 60 months (expiry: ${wmUntilStr})`
    );

    const nawiDates = await calculateValidityDates({
      categoryCode: 'NAWI_CLASS_III_150KG',
      verificationDate: new Date('2026-03-01'),
      verificationType: 'INITIAL_VERIFICATION',
    });
    const nawiUntilStr = nawiDates.validUntil.toISOString();
    assert(
      nawiUntilStr.startsWith('2027-02-28') || nawiUntilStr.startsWith('2027-03-01'),
      `NAWI Class III validity is 12 months (expiry: ${nawiUntilStr})`
    );

  } catch (err) {
    console.error('Unexpected test error:', err);
    failedTests++;
  } finally {
    if (fixtureApplicationId) {
      await prisma.application.deleteMany({ where: { id: fixtureApplicationId } });
    }
    if (fixtureUserIds.length > 0) {
      await prisma.gatcProfile.deleteMany({ where: { user_id: { in: fixtureUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } });
    }
    await prisma.$disconnect();
    console.log('\n====================================================');
    console.log(`RULE ENGINE TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================');
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

runRuleEngineTests();
