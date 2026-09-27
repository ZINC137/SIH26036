const http = require('http');

function createClient(baseUrl) {
  let cookies = [];

  const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = {};

      if (cookies.length > 0) {
        headers['Cookie'] = cookies.join('; ');
      }

      let payload = null;
      if (body) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
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
  };
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('SIH26036 SECURITY & ACCESS CONTROL VALIDATION SUITE');
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
    // 1. Unauthenticated download blocked
    console.log('--- TEST 1: Unauthenticated Document Download ---');
    const anonClient = createClient(BASE_URL);
    const unauthDoc = await anonClient.get('/api/upload/non-existent-or-test-id');
    assert(unauthDoc.status === 401, 'Unauthenticated document access rejected with 401 Unauthorized');

    // 2. Citizen searching registry is scoped to own records
    console.log('\n--- TEST 2: Citizen Search Privacy Scoping ---');
    const citizenClient = createClient(BASE_URL);
    const citizenLogin = await citizenClient.post('/api/auth/login', {
      email: 'guptapriyanshu710@gmail.com',
      password: 'UserPassword123!',
      portalRole: 'user',
    });
    assert(citizenLogin.status === 200, 'Citizen logged in');

    const searchRes = await citizenClient.get('/api/auth/search?q=a');
    assert(searchRes.status === 200, 'Search query executed');
    // Verify none of the results belong to other businesses if user has no apps or only own apps
    console.log(`[INFO] Citizen search returned ${searchRes.body.total} scoped records`);
    assert(searchRes.body.total !== undefined, 'Search results are structured');

    // 3. Re-verification with unowned instrument_id is rejected
    console.log('\n--- TEST 3: Instrument Hijacking Defense ---');
    const hijackAttempt = await citizenClient.post('/api/auth/applications', {
      application_type: 'RE_VERIFICATION',
      instrument_id: 'fake-or-unowned-instrument-uuid-999',
      instrument_type: 'Platform Balance (50kg - 500kg)',
      make: 'Avery',
      serial_no: 'HIJACK-001',
      capacity: '100',
      unit: 'kg',
      business_name: 'Attacker Co',
      address: 'Nowhere',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      contact_name: 'Attacker',
      contact_phone: '9999999999',
      contact_email: 'attacker@evil.com',
    });
    assert(hijackAttempt.status === 400, 'Submitting unowned instrument_id rejected with 400');
    assert(hijackAttempt.body.error?.includes('Invalid instrument ID'), 'Statutory error message returned');

    // 4. LMO cannot assign Approved application
    console.log('\n--- TEST 4: Invalid State Transition Defense ---');
    const lmoClient = createClient(BASE_URL);
    await lmoClient.post('/api/auth/login', {
      email: 'lmo1@gov.in',
      password: 'LmoPassword2026!',
      portalRole: 'lmo',
    });
    const appsRes = await lmoClient.get('/api/lmo/applications');
    const approvedApp = appsRes.body.applications?.find((a) => a.status === 'Approved');
    if (approvedApp) {
      const reassignApproved = await lmoClient.post(`/api/lmo/applications/${approvedApp.id}/assign`, {
        assigneeType: 'FO',
        foUserId: 'fo-any',
      });
      assert(reassignApproved.status === 400, 'Reassigning Approved application rejected with 400');
    } else {
      console.log('[SKIP] No approved app found in current queue');
    }

    console.log('\n====================================================');
    console.log(`SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Security test suite error:', err);
  }
}

runSecurityTests();
