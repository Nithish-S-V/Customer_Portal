/**
 * Quick server status check
 */
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

function checkServer() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://localhost:3443/health', { agent }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Server is running!');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log('❌ Server is NOT running');
      console.log(`   Error: ${error.message}`);
      console.log('');
      console.log('💡 Start the server with: cd middleware && npm start');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Server timeout');
      resolve(false);
    });
  });
}

checkServer();
