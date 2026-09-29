const http = require('http');
const crypto = require('crypto');

function createClient(baseUrl) {
  let cookies = [];
  let token = null;

  const request = (method, path, body = null, customHeaders = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { ...customHeaders };

      if (cookies.length > 0) {
        headers['Cookie'] = cookies.join('; ');
      }
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let payload = null;
      if (body && typeof body === 'object' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
        headers['Content-Length'] = Buffer.byteLength(payload);
      } else if (body && typeof body === 'string') {
        payload = body;
        headers['Content-Length'] = Buffer.byteLength(payload);
      } else if (Buffer.isBuffer(body)) {
        payload = body;
        headers['Content-Length'] = payload.length;
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
              resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
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
    get: (path, headers) => request('GET', path, null, headers),
    post: (path, body, headers) => request('POST', path, body, headers),
    put: (path, body, headers) => request('PUT', path, body, headers),
    delete: (path, headers) => request('DELETE', path, null, headers),
    setToken: (t) => { token = t; },
    getToken: () => token,
    clearAuth: () => { cookies = []; token = null; },
  };
}

// Multipart form-data helper for upload security testing
function buildMultipartBody(fields, fileField) {
  const boundary = `----AuditBoundary${crypto.randomBytes(8).toString('hex')}`;
  const buffers = [];

  for (const [key, val] of Object.entries(fields)) {
    buffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }

  if (fileField) {
    buffers.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`
      )
    );
    buffers.push(fileField.buffer);
    buffers.push(Buffer.from('\r\n'));
  }

  buffers.push(Buffer.from(`--${boundary}--\r\n`));
  const fullBody = Buffer.concat(buffers);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: fullBody,
  };
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('SIH26036 COMPREHENSIVE SECURITY, PRIVACY & RED-TEAM QA AUDIT');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;
  const findings = [];

  function testResult(name, condition, details = {}) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
      findings.push({ name, ...details });
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: UNAUTHENTICATED ENDPOINT ACCESS (Authentication Enforcement)
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Unauthenticated Access Controls ---');
  const anon = createClient(BASE_URL);

  const unauthTests = [
    { name: 'Admin LMO list', path: '/api/admin/lmo/list', expected: 401 },
    { name: 'Admin User list', path: '/api/admin/users', expected: 401 },
    { name: 'Admin Audit logs', path: '/api/admin/audit-logs', expected: 401 },
    { name: 'LMO applications queue', path: '/api/lmo/applications', expected: 401 },
    { name: 'Field Officer tasks', path: '/api/field-officer/tasks', expected: 401 },
    { name: 'GATC tasks', path: '/api/gatc/tasks', expected: 401 },
    { name: 'Upload document download API', path: '/api/upload/test-id-123', expected: 401 },
    { name: 'Rules admin rulesets', path: '/api/rules/admin/rulesets', expected: 401 },
    { name: 'Citizen profile', path: '/api/auth/me', expected: 401 },
    { name: 'Citizen applications', path: '/api/auth/applications', expected: 401 },
    { name: 'Static uploads direct path', path: '/uploads/doc-audit-test.pdf', expected: 401 },
  ];

  for (const t of unauthTests) {
    const res = await anon.get(t.path);
    testResult(
      `Unauth request to ${t.name} rejected with ${t.expected}`,
      res.status === t.expected,
      { path: t.path, actualStatus: res.status, expected: t.expected }
    );
  }

  // -------------------------------------------------------------
  // SECTION 2: TOKEN INTEGRITY & MALFORMED TOKEN HANDLING
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: Token Integrity & Validation ---');
  const forgedToken = anon.get('/api/auth/me', {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiZXhwIjoxOTk5OTk5OTk5fQ.invalidsignature123'
  });
  const forgedRes = await forgedToken;
  testResult('Forged JWT signature rejected with 401', forgedRes.status === 401, { status: forgedRes.status });

  const malformedToken = await anon.get('/api/auth/me', {
    'Authorization': 'Bearer NOT_A_JWT_TOKEN'
  });
  testResult('Malformed Bearer token rejected with 401', malformedToken.status === 401, { status: malformedToken.status });

  // -------------------------------------------------------------
  // SECTION 3: AUTHENTICATION LOGIN & PORTAL SEPARATION
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: Authentication & Portal Role Separation ---');

  // Test Citizen Login
  const citizen = createClient(BASE_URL);
  const citizenLoginRes = await citizen.post('/api/auth/login', {
    email: 'priya@example.com',
    password: 'UserPassword123!',
    portalRole: 'user',
  });
  testResult('Citizen login succeeded', citizenLoginRes.status === 200);
  if (citizenLoginRes.body.token) citizen.setToken(citizenLoginRes.body.token);

  // Test Portal Role Mismatch: Citizen attempting to log in via Admin Portal
  const citizenPortalBypass = await anon.post('/api/auth/login', {
    email: 'priya@example.com',
    password: 'UserPassword123!',
    portalRole: 'admin',
  });
  testResult(
    'Citizen attempting Admin portal login rejected with 403 PORTAL_ROLE_MISMATCH',
    citizenPortalBypass.status === 403 && citizenPortalBypass.body.code === 'PORTAL_ROLE_MISMATCH',
    { status: citizenPortalBypass.status, body: citizenPortalBypass.body }
  );

  // Test Field Officer Login
  const fo = createClient(BASE_URL);
  const foLoginRes = await fo.post('/api/auth/login', {
    email: 'anjali@example.com',
    password: 'FoPassword123!',
    portalRole: 'field_officer',
  });
  testResult('Field Officer login succeeded', foLoginRes.status === 200);
  if (foLoginRes.body.token) fo.setToken(foLoginRes.body.token);

  // Test LMO Login
  const lmo = createClient(BASE_URL);
  const lmoLoginRes = await lmo.post('/api/auth/login', {
    email: 'lmo1@gov.in',
    password: 'LmoPassword2026!',
    portalRole: 'lmo',
  });
  testResult('LMO login succeeded', lmoLoginRes.status === 200);
  if (lmoLoginRes.body.token) lmo.setToken(lmoLoginRes.body.token);

  // Test GATC Login
  const gatc = createClient(BASE_URL);
  const gatcLoginRes = await gatc.post('/api/auth/login', {
    email: 'gatc1@gov.in',
    password: 'GatcPassword123!',
    portalRole: 'gatc',
  });
  testResult('GATC login succeeded', gatcLoginRes.status === 200);
  if (gatcLoginRes.body.token) gatc.setToken(gatcLoginRes.body.token);

  // Test Admin Login
  const admin = createClient(BASE_URL);
  const adminLoginRes = await admin.post('/api/auth/login', {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    portalRole: 'admin',
  });
  testResult('Admin login succeeded', adminLoginRes.status === 200);
  if (adminLoginRes.body.token) admin.setToken(adminLoginRes.body.token);

  // -------------------------------------------------------------
  // SECTION 4: BROKEN ACCESS CONTROL / RBAC (Horizontal & Vertical Escalation)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: Role-Based Access Control (RBAC) ---');

  // Citizen attempting Admin endpoints
  const citizenAdmin1 = await citizen.get('/api/admin/users');
  testResult('Citizen accessing /api/admin/users blocked with 403', citizenAdmin1.status === 403, { status: citizenAdmin1.status });

  const citizenAdmin2 = await citizen.post('/api/admin/users/status', { userId: 'any', role: 'admin' });
  testResult('Citizen updating user status via admin API blocked with 403', citizenAdmin2.status === 403, { status: citizenAdmin2.status });

  // Citizen attempting LMO queue
  const citizenLmo = await citizen.get('/api/lmo/applications');
  testResult('Citizen accessing /api/lmo/applications blocked with 403', citizenLmo.status === 403, { status: citizenLmo.status });

  // Citizen attempting Field Officer tasks
  const citizenFo = await citizen.get('/api/field-officer/tasks');
  testResult('Citizen accessing /api/field-officer/tasks blocked with 403', citizenFo.status === 403, { status: citizenFo.status });

  // Citizen attempting GATC tasks
  const citizenGatc = await citizen.get('/api/gatc/tasks');
  testResult('Citizen accessing /api/gatc/tasks blocked with 403', citizenGatc.status === 403, { status: citizenGatc.status });

  // Field Officer attempting Admin APIs
  const foAdmin = await fo.get('/api/admin/audit-logs');
  testResult('Field Officer accessing /api/admin/audit-logs blocked with 403', foAdmin.status === 403, { status: foAdmin.status });

  // LMO attempting Admin user status toggle
  const lmoAdmin = await lmo.post('/api/admin/users/status', { userId: 'any', role: 'admin' });
  testResult('LMO accessing /api/admin/users/status blocked with 403', lmoAdmin.status === 403, { status: lmoAdmin.status });

  // -------------------------------------------------------------
  // SECTION 5: MASS ASSIGNMENT & WORKFLOW TAMPERING DEFENSE
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: Mass Assignment & Workflow Tampering ---');

  // Attempt mass assignment during application submission: trying to submit status: 'Approved' and certificate_no
  const massAssignApp = await citizen.post('/api/auth/applications', {
    instrument_type: 'Platform Balance (50kg - 500kg)',
    make: 'Testing Brand',
    serial_no: `SN-AUDIT-${Date.now()}`,
    capacity: '200',
    unit: 'kg',
    business_name: 'Audit Traders',
    address: 'Auditing St',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    contact_name: 'Audit Person',
    contact_phone: '9876543210',
    contact_email: 'audit@example.com',
    // Malicious mass assignment fields
    status: 'Approved',
    certificate_no: 'MALICIOUS-CERT-001',
    payment_status: 'UNPAID',
    assigned_lmo_id: 'arbitrary-id',
  });

  testResult('Application created successfully', massAssignApp.status === 201);
  const createdApp = massAssignApp.body.application;
  if (createdApp) {
    testResult(
      'Mass assignment prevented: status is "Pending" not "Approved"',
      createdApp.status === 'Pending',
      { actualStatus: createdApp.status }
    );
    testResult(
      'Mass assignment prevented: certificate_no is null',
      createdApp.certificate_no === null,
      { actualCert: createdApp.certificate_no }
    );
  }

  // Workflow tampering: Field Officer attempting to directly approve application without LMO
  const foApproveAttempt = await fo.post(`/api/field-officer/applications/${createdApp?.id}/inspect`, {
    inspection_result: 'Approved',
    status: 'Approved',
  });
  testResult(
    'Field Officer cannot set status directly to Approved (must go through LMO)',
    foApproveAttempt.body.application?.status !== 'Approved',
    { status: foApproveAttempt.status, appStatus: foApproveAttempt.body.application?.status }
  );

  // -------------------------------------------------------------
  // SECTION 6: IDOR (INDIRECT OBJECT REFERENCE) & LEAST PRIVILEGE
  // -------------------------------------------------------------
  console.log('\n--- SECTION 6: IDOR & Object-Level Access Control ---');

  const appIdA = createdApp?.id;
  if (appIdA) {
    // Unauthenticated request to specific application ID
    const unauthApp = await anon.get(`/api/auth/applications/${appIdA}`);
    testResult('Unauthenticated access to specific application rejected with 401', unauthApp.status === 401);

    // Document listing for application
    const unauthDocs = await anon.get(`/api/upload/application/${appIdA}`);
    testResult('Unauthenticated access to application documents rejected with 401', unauthDocs.status === 401);

    // Unassigned Field Officer attempting to access application documents
    const unassignedFoDocs = await fo.get(`/api/upload/application/${appIdA}`);
    testResult(
      'Unassigned Field Officer accessing unassigned application documents rejected with 403',
      unassignedFoDocs.status === 403,
      { status: unassignedFoDocs.status }
    );

    // Unassigned GATC attempting to access application documents
    const unassignedGatcDocs = await gatc.get(`/api/upload/application/${appIdA}`);
    testResult(
      'Unassigned GATC accessing unassigned application documents rejected with 403',
      unassignedGatcDocs.status === 403,
      { status: unassignedGatcDocs.status }
    );

    // Citizen owner accessing own application documents
    const ownerDocs = await citizen.get(`/api/upload/application/${appIdA}`);
    testResult('Citizen owner can access own application documents', ownerDocs.status === 200, { status: ownerDocs.status });

    // LMO supervisor accessing application documents
    const lmoDocs = await lmo.get(`/api/upload/application/${appIdA}`);
    testResult('LMO supervisor can access application documents', lmoDocs.status === 200, { status: lmoDocs.status });
  }

  // -------------------------------------------------------------
  // SECTION 7: STATIC UPLOADS DIRECT PATH DEFENSE
  // -------------------------------------------------------------
  console.log('\n--- SECTION 7: File Upload Static Exposure & Authorization ---');
  // 1. Unauthenticated request to /uploads
  const unauthUpload = await anon.get('/uploads/doc-nonexistent-test.pdf');
  testResult(
    'Unauthenticated direct access to /uploads rejected with 401',
    unauthUpload.status === 401,
    { status: unauthUpload.status }
  );

  // -------------------------------------------------------------
  // SECTION 8: HTTP SECURITY HEADERS AUDIT
  // -------------------------------------------------------------
  console.log('\n--- SECTION 8: Security Headers Audit ---');
  const pingRes = await anon.get('/api/rules/categories');
  const respHeaders = pingRes.headers;

  testResult(
    'Security Header: X-Content-Type-Options: nosniff present',
    respHeaders['x-content-type-options'] === 'nosniff',
    { actual: respHeaders['x-content-type-options'] }
  );
  testResult(
    'Security Header: X-Frame-Options: SAMEORIGIN present',
    respHeaders['x-frame-options'] === 'SAMEORIGIN',
    { actual: respHeaders['x-frame-options'] }
  );
  testResult(
    'Security Header: Content-Security-Policy present',
    respHeaders['content-security-policy'] !== undefined,
    { actual: respHeaders['content-security-policy'] }
  );
  testResult(
    'Security Header: X-Powered-By is omitted',
    respHeaders['x-powered-by'] === undefined,
    { actual: respHeaders['x-powered-by'] }
  );

  // -------------------------------------------------------------
  // SECTION 9: SEARCH PRIVACY / INFORMATION DISCLOSURE
  // -------------------------------------------------------------
  console.log('\n--- SECTION 9: Search Privacy & Field Scoping ---');
  const citizenSearch = await citizen.get('/api/auth/search?q=Testing');
  testResult('Citizen search executed successfully', citizenSearch.status === 200);
  if (citizenSearch.body.results) {
    const hasUnowned = citizenSearch.body.results.some(
      (r) => r.businessName !== 'Audit Traders' && r.businessName !== 'Metro Commercial Traders Ltd.'
    );
    testResult('Citizen search does not leak other users records', !hasUnowned, { resultsCount: citizenSearch.body.total });
  }

  // -------------------------------------------------------------
  // SECTION 10: INJECTION DEFENSE (SQL, ORM, COMMAND)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 10: Injection Attack Resistance ---');
  const injectionQueries = [
    "' OR '1'='1",
    "'; DROP TABLE Application; --",
    "{\"gt\": \"\"}",
    "<script>alert(1)</script>",
    "../../../../etc/passwd",
  ];

  for (const q of injectionQueries) {
    const injRes = await citizen.get(`/api/auth/search?q=${encodeURIComponent(q)}`);
    testResult(
      `Search injection query safe [${q.slice(0, 15)}...]`,
      injRes.status === 200 && Array.isArray(injRes.body.results),
      { status: injRes.status }
    );
  }

  // -------------------------------------------------------------
  // SECTION 11: CREDENTIAL PROTECTION IN ADMIN APPOINTMENT
  // -------------------------------------------------------------
  console.log('\n--- SECTION 11: Credential Protection in Admin APIs ---');
  const lmoSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const appointRes = await admin.post('/api/admin/lmo/appoint', {
    name: `Test LMO ${lmoSuffix}`,
    email: `test_lmo_${lmoSuffix.toLowerCase()}@gov.in`,
    employeeCode: `LMO-AUDIT-${lmoSuffix}`,
    gazetteOrderRef: `GO/DL/AUDIT/${lmoSuffix}`,
    state: 'Delhi',
    district: 'North Delhi',
  });

  testResult('Admin appointed LMO successfully', appointRes.status === 201);
  testResult(
    'Admin LMO appointment does NOT disclose plain password in API response',
    appointRes.body.lmo?.defaultPassword === undefined && appointRes.body.lmo?.hasInitialCredentials === true,
    { lmoBody: appointRes.body.lmo }
  );

  // -------------------------------------------------------------
  // SECTION 12: MALICIOUS FILE UPLOAD SECURITY
  // -------------------------------------------------------------
  console.log('\n--- SECTION 12: Malicious File Upload Defense ---');

  // 12a. Executable file disguised as upload (.exe)
  const exeMultipart = buildMultipartBody(
    { doc_type: 'SUPPORTING_DOCUMENT', application_id: appIdA },
    { name: 'file', filename: 'malware.exe', contentType: 'image/jpeg', buffer: Buffer.from('MZ\x90\x00FAKEEXE') }
  );
  const exeUploadRes = await citizen.post('/api/upload', exeMultipart.body, { 'Content-Type': exeMultipart.contentType });
  testResult('Uploading .exe file rejected with 400 Bad Request', exeUploadRes.status === 400, { status: exeUploadRes.status, body: exeUploadRes.body });

  // 12b. Double extension attack (invoice.pdf.exe)
  const doubleExtMultipart = buildMultipartBody(
    { doc_type: 'SUPPORTING_DOCUMENT', application_id: appIdA },
    { name: 'file', filename: 'invoice.pdf.exe', contentType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nFAKE') }
  );
  const doubleExtRes = await citizen.post('/api/upload', doubleExtMultipart.body, { 'Content-Type': doubleExtMultipart.contentType });
  testResult('Double extension dangerous file rejected with 400 Bad Request', doubleExtRes.status === 400, { status: doubleExtRes.status });

  // 12c. Path traversal in filename (..secret.jpg or test..jpg)
  const traversalMultipart = buildMultipartBody(
    { doc_type: 'SUPPORTING_DOCUMENT', application_id: appIdA },
    { name: 'file', filename: '..secret.jpg', contentType: 'image/jpeg', buffer: Buffer.from('\xFF\xD8\xFF\xE0FAKEJPG') }
  );
  const traversalRes = await citizen.post('/api/upload', traversalMultipart.body, { 'Content-Type': traversalMultipart.contentType });
  testResult('Path traversal in filename rejected with 400 Bad Request', traversalRes.status === 400, { status: traversalRes.status, body: traversalRes.body });

  // 12d. MIME type mismatch (.pdf extension with image/jpeg header)
  const mimeMismatchMultipart = buildMultipartBody(
    { doc_type: 'SUPPORTING_DOCUMENT', application_id: appIdA },
    { name: 'file', filename: 'document.pdf', contentType: 'image/jpeg', buffer: Buffer.from('%PDF-1.4\nFAKE') }
  );
  const mimeMismatchRes = await citizen.post('/api/upload', mimeMismatchMultipart.body, { 'Content-Type': mimeMismatchMultipart.contentType });
  testResult('MIME type mismatch rejected with 400 Bad Request', mimeMismatchRes.status === 400, { status: mimeMismatchRes.status });

  // 12e. Valid JPEG file upload succeeds
  const validJpgMultipart = buildMultipartBody(
    { doc_type: 'INSTRUMENT_PHOTO', application_id: appIdA },
    { name: 'file', filename: 'test_scale.jpg', contentType: 'image/jpeg', buffer: Buffer.from('\xFF\xD8\xFF\xE0VALIDJPGDATA') }
  );
  const validUploadRes = await citizen.post('/api/upload', validJpgMultipart.body, { 'Content-Type': validJpgMultipart.contentType });
  testResult('Legitimate JPG upload succeeds with 201 Created', validUploadRes.status === 201, { status: validUploadRes.status });

  // -------------------------------------------------------------
  // SECTION 13: ADMIN SAFETY & INPUT VALIDATION
  // -------------------------------------------------------------
  console.log('\n--- SECTION 13: Admin Safety & Status Input Validation ---');

  // Invalid role rejection
  const invalidRoleRes = await admin.post('/api/admin/users/status', {
    userId: massAssignApp.body.application?.user_id,
    role: 'SUPER_GOD_ADMIN',
  });
  testResult('Setting invalid role rejected with 400 Bad Request', invalidRoleRes.status === 400, { status: invalidRoleRes.status });

  // Admin self-demotion rejection
  const adminMe = await admin.get('/api/auth/me');
  const selfDemoteRes = await admin.post('/api/admin/users/status', {
    userId: adminMe.body.user?.id,
    role: 'user',
  });
  testResult('Admin self-demotion prevented with 400 Bad Request', selfDemoteRes.status === 400, { status: selfDemoteRes.status });

  // -------------------------------------------------------------
  // SECTION 14: VERIFICATION TOKEN HANDLING
  // -------------------------------------------------------------
  console.log('\n--- SECTION 14: Verification Token Handling ---');
  const invalidVerifyHtml = await anon.get('/api/auth/verify?token=fake_invalid_token_9999', {
    'Accept': 'text/html',
  });
  testResult(
    'Invalid verification token in HTML mode returns 400 (not misleading 200 OK)',
    invalidVerifyHtml.status === 400,
    { status: invalidVerifyHtml.status }
  );

  console.log('\n================================================================');
  console.log(`FINAL SECURITY AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (findings.length > 0) {
    console.log('REMAINING UNRESOLVED FINDINGS:');
    findings.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} => ${JSON.stringify(f)}`));
  } else {
    console.log('ALL DEFENSIVE CONTROLS AND REGRESSION TESTS VERIFIED SUCCESSFULLY!');
  }
}

runComprehensiveAudit().catch(console.error);
