const http = require('http');

// Helper to make requests with cookie jar
function createClient(baseUrl) {
  let cookies = [];

  const request = (method, path, body = null, isMultipart = false, boundary = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = {};

      if (cookies.length > 0) {
        headers['Cookie'] = cookies.join('; ');
      }

      let payload = null;
      if (body) {
        if (isMultipart) {
          headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
          payload = body;
        } else {
          headers['Content-Type'] = 'application/json';
          payload = JSON.stringify(body);
        }
        headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers,
        },
        (res) => {
          let data = '';
          if (res.headers['set-cookie']) {
            res.headers['set-cookie'].forEach((c) => {
              const cookiePart = c.split(';')[0];
              cookies = cookies.filter((existing) => !existing.startsWith(cookiePart.split('=')[0] + '='));
              cookies.push(cookiePart);
            });
          }

          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode, headers: res.headers, body: json });
            } catch (e) {
              resolve({ status: res.statusCode, headers: res.headers, raw: data });
            }
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    postMultipart: (path, buffer, boundary) => request('POST', path, buffer, true, boundary),
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('SIH26036 COMPREHENSIVE END-TO-END WORKFLOW TEST SUITE');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. GATC Authentication & Role Check
    console.log('--- TEST 1: GATC Portal Authentication ---');
    const gatcClient = createClient(BASE_URL);
    const gatcLogin = await gatcClient.post('/api/auth/login', {
      email: 'gatc1@gov.in',
      password: 'GatcPassword123!',
      portalRole: 'gatc',
    });
    assert(gatcLogin.status === 200, 'GATC login succeeded with 200');
    assert(gatcLogin.body.user?.role === 'gatc', 'GATC role verified in session payload');
    assert(gatcLogin.body.user?.gatcProfile?.gatc_code === 'GATC-DL-01', 'GATC accredited lab profile linked');

    // 2. Citizen / Trader Registration & Login
    console.log('\n--- TEST 2: Citizen / Trader Authentication & Session ---');
    const userClient = createClient(BASE_URL);
    const userEmail = 'guptapriyanshu710@gmail.com';
    const userLogin = await userClient.post('/api/auth/login', {
      email: userEmail,
      password: 'UserPassword123!',
      portalRole: 'user',
    });
    assert(userLogin.status === 200, 'Citizen login succeeded with 200');
    assert(userLogin.body.user?.role === 'user', 'Citizen role verified');

    // 3. Document / Photograph Upload
    console.log('\n--- TEST 3: Document Upload API ---');
    const boundary = '----WebKitFormBoundarySIH26036Test';
    const fileContent = 'Simulated Weighing Scale Nameplate Image Content';
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="doc_type"\r\n\r\n` +
      `INSTRUMENT_PHOTO\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="nameplate.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `${fileContent}\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await userClient.postMultipart('/api/upload', multipartBody, boundary);
    assert(uploadRes.status === 201, 'Document uploaded via /api/upload (201)');
    assert(uploadRes.body.document?.id != null, 'Uploaded document ID generated');
    const docId = uploadRes.body.document?.id;

    // 4. Initial Verification Application Submission
    console.log('\n--- TEST 4: Initial Statutory Verification Filing ---');
    const serialNumber = `WS-DEL-${Date.now().toString().slice(-6)}`;
    const appRes = await userClient.post('/api/auth/applications', {
      application_type: 'INITIAL_VERIFICATION',
      instrument_type: 'Platform Balance (50kg - 500kg)',
      make: 'Avery Weigh-Tronix',
      model: 'E-1010-PRO',
      serial_no: serialNumber,
      capacity: '300',
      unit: 'kg',
      business_name: 'Metro Retail Mart',
      gst_no: '07AAAAA0000A1Z5',
      address: 'Shop 14, Azadpur Mandi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110033',
      contact_name: 'Metro Retail Mart',
      contact_phone: '9876543210',
      contact_email: userEmail,
      inspection_mode: 'AT_CENTRE',
      preferred_date: '2026-10-15',
      document_ids: docId ? [docId] : [],
    });
    assert(appRes.status === 201, 'Application submitted with 201 Created');
    assert(appRes.body.application?.app_number != null, 'Official Application number generated');
    const appId = appRes.body.application?.id;
    const appNumber = appRes.body.application?.app_number;

    // 5. LMO Reviews Pending & Fetches GATC Centres
    console.log('\n--- TEST 5: LMO Queue & GATC Allocation ---');
    const lmoClient = createClient(BASE_URL);
    const lmoLogin = await lmoClient.post('/api/auth/login', {
      email: 'lmo1@gov.in',
      password: 'LmoPassword2026!',
      portalRole: 'lmo',
    });
    assert(lmoLogin.status === 200, 'LMO logged in successfully');

    const gatcCentresRes = await lmoClient.get('/api/lmo/gatc-centres');
    assert(gatcCentresRes.status === 200, 'LMO retrieved accredited GATC testing centres');
    const centres = gatcCentresRes.body.centres || gatcCentresRes.body.gatcCentres || [];
    assert(centres.length > 0, 'Found registered GATC centres');

    const targetGatc = centres.find((c) => c.email === 'gatc1@gov.in') || centres[0];

    // Allocate application to GATC
    const assignRes = await lmoClient.post(`/api/lmo/applications/${appId}/assign`, {
      assigneeType: 'GATC',
      gatcUserId: targetGatc.dbId || targetGatc.userId || targetGatc.id,
      scheduledDate: '2026-10-16',
      scheduledTime: '11:00',
      priority: 'High',
      notes: 'Scheduled for precision test at accredited GATC lab.',
    });
    assert(assignRes.status === 200, 'Application allocated to GATC centre');

    // 6. GATC Views Task & Submits Calibration/Verification Report
    console.log('\n--- TEST 6: GATC Task Queue & Laboratory Verification ---');
    const tasksRes = await gatcClient.get('/api/gatc/tasks');
    assert(tasksRes.status === 200, 'GATC tasks fetched');
    const assignedTask = tasksRes.body.tasks?.find((t) => t.id === appId);
    assert(assignedTask != null, 'Assigned task visible in GATC testing queue');

    const reportRes = await gatcClient.post(`/api/gatc/tasks/${appId}/report`, {
      inspection_result: 'Passed',
      test_error_percentage: 0.015,
      security_seal_no: `SEAL-GATC-${Date.now().toString().slice(-5)}`,
      working_standards_used: 'NABL Class F1 Stainless Steel Weight Set (1g-50kg) Cert #CAL-2026-09',
      environmental_temp: '22.4°C / 54% RH (Calibrated Environmental Chamber)',
      inspection_notes: 'Repeatability and eccentricity within Schedule VI tolerances. Stamping and lead-wire seal affixed.',
    });
    if (reportRes.status !== 200) {
      console.error('DEBUG REPORT RES:', reportRes.status, reportRes.body);
    }
    assert(reportRes.status === 200, 'GATC test report submitted with working standards');

    // 7. LMO Signs and Issues Section 24 Digital Certificate
    console.log('\n--- TEST 7: LMO Endorsement & Certificate Issuance ---');
    const issueRes = await lmoClient.post(`/api/lmo/applications/${appId}/review`, {
      action: 'approve',
      notes: 'Reviewed GATC laboratory test report #GATC-DL-01. Verification certified under Section 24 of Legal Metrology Act, 2009.',
    });
    assert(issueRes.status === 200, 'Certificate issued under Section 24');
    assert(issueRes.body.certificateNo, `Digital Certificate issued: ${issueRes.body.certificateNo}`);

    // 8. Verify Instrument Entity & Lifecycle Tracking
    console.log('\n--- TEST 8: Instrument First-Class Entity & Lifecycle Tracking ---');
    const instRes = await userClient.get('/api/auth/instruments');
    assert(instRes.status === 200, 'User instruments fetched');
    assert(instRes.body.instruments?.length > 0, 'Instrument persisted in Central Digital Registry');
    const createdInst = instRes.body.instruments?.find((i) => i.serial_no === serialNumber);
    assert(createdInst != null, 'Instrument matched by serial number');
    assert(createdInst.current_status === 'VERIFIED', 'Instrument status is VERIFIED');
    assert(createdInst.validity_expiry_date != null, 'Instrument has statutory validity expiry date');
    assert(createdInst.current_certificate_no === issueRes.body.certificateNo, 'Instrument tracks active certificate number');

    // 9. Re-verification Workflow Linking
    console.log('\n--- TEST 9: Periodical Re-verification Filing ---');
    const reverifyRes = await userClient.post('/api/auth/applications', {
      application_type: 'RE_VERIFICATION',
      instrument_id: createdInst.id,
      previous_certificate_no: createdInst.current_certificate_no,
      instrument_type: createdInst.instrument_type,
      make: createdInst.make,
      model: createdInst.model,
      serial_no: createdInst.serial_no,
      capacity: createdInst.capacity,
      unit: createdInst.unit,
      business_name: 'Metro Retail Mart',
      address: 'Shop 14, Azadpur Mandi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110033',
      contact_name: 'Metro Retail Mart',
      contact_phone: '9876543210',
      contact_email: userEmail,
    });
    assert(reverifyRes.status === 201, 'Re-verification application lodged (201)');
    assert(reverifyRes.body.application?.application_type === 'RE_VERIFICATION', 'Application type is RE_VERIFICATION');
    assert(reverifyRes.body.application?.instrument_id === createdInst.id, 'Linked to persistent Instrument entity');

    // 10. Search Registry API
    console.log('\n--- TEST 10: Multi-Field Search & Retrieval API ---');
    const searchRes = await lmoClient.get(`/api/auth/search?q=${serialNumber}`);
    assert(searchRes.status === 200, 'Search query executed successfully');
    assert(searchRes.body.results?.length > 0, 'Found instrument in search results by serial number');

    // 11. Notifications Check
    console.log('\n--- TEST 11: Citizen Notifications & Expiry Tracking ---');
    const notifsRes = await userClient.get('/api/auth/notifications');
    assert(notifsRes.status === 200, 'User notifications fetched');
    assert(notifsRes.body.notifications?.length > 0, 'Notifications delivered to citizen');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with unhandled error:', err);
    process.exit(1);
  }
}

runTests();
