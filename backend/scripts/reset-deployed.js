const DEPLOYED_URL = process.env.DEPLOYED_BACKEND_URL || 'https://sih26036-final.onrender.com';

async function resetDeployed() {
  console.log(`🌐 Connecting to deployed backend at: ${DEPLOYED_URL}...`);

  try {
    console.log('🔑 Authenticating as System Administrator...');
    const loginRes = await fetch(`${DEPLOYED_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        portalRole: 'admin',
      }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Authentication failed: ${loginData.error || loginRes.statusText}`);
    }
    console.log('✅ Admin authentication successful.');

    console.log('🧹 Triggering cloud database cleanup & statutory re-seeding...');
    const resetRes = await fetch(`${DEPLOYED_URL}/api/admin/system/reset-database`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
    });

    const resetData = await resetRes.json();
    if (!resetRes.ok) {
      if (resetRes.status === 404) {
        console.log('⏳ Render is currently deploying the updated backend commit.');
        console.log('💡 Please wait ~60-90 seconds for Render deployment to finish, then rerun: npm run db:reset-deployed');
        return;
      }
      throw new Error(`Reset failed: ${resetData.error || resetRes.statusText}`);
    }

    console.log('✨ Cloud Database Reset Result:', resetData);
    console.log('\n🎉 Successfully cleared and reset the deployed database on Render!');
  } catch (error) {
    console.error('❌ Request error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDeployed();
}

module.exports = { resetDeployed };
