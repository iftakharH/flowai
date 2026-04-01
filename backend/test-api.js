const axios = require('axios');

const testApi = async () => {
  try {
    console.log('Testing /api/health...');
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('Health OK:', health.data);

    console.log('Testing /api/transactions (without auth)...');
    const tx = await axios.get('http://localhost:5000/api/transactions');
    console.log('TX:', tx.status);
  } catch (error) {
    console.log('Error Status:', error.response?.status);
    console.log('Error Data:', error.response?.data);
  }
};

testApi();
