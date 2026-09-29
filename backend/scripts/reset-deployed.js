const axios = require('axios');

const DEPLOYED_URL = process.env.DEPLOYED_BACKEND_URL || 'https://sih26036-final.onrender.com';

async function resetDeployed() {
  console.log(`🌐 Connecting to deployed backend at: ${DEPLOYED_URL}...`);

  try {
    console.log('🔑 Authenticating as System Administrator...');
    const loginRes = await axios.post(`${DEPLOYED_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      portalRole: 'admin',
    });

    const token = loginRes.data.token;
    if (!token) {
      throw new Error('Failed to obtain admin token.');
    }
    console.log('✅ Admin authentication successful.');

    console.log('🧹 Triggering cloud database cleanup & statutory re-seeding...');
    const resetRes = await axios.post(
      `${DEPLOYED_URL}/api/admin/system/reset-database`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✨ Cloud Database Reset Result:', resetRes.data);
    console.log('\n🎉 Successfully cleared and reset the deployed database on Render!');
  } catch (error) {
    if (error.response) {
      console.error(`❌ Cloud reset failed [${error.response.status}]:`, error.response.data);
      if (error.response.status === 404) {
        console.error('💡 Note: If Render is still deploying the latest commit, please wait 1-2 minutes for the deployment to complete and run this script again.');
      }
    } else {
      console.error('❌ Request error:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  resetDeployed();
}

module.exports = { resetDeployed };
