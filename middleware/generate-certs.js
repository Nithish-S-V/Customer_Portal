const forge = require('node-forge');
const fs = require('fs');

console.log('Generating self-signed SSL certificates...');

// Check if certificates already exist
if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
  console.log('Certificates already exist. Skipping generation.');
  process.exit(0);
}

try {
  // Generate a key pair
  console.log('Step 1: Generating RSA key pair (2048 bits)...');
  const keys = forge.pki.rsa.generateKeyPair(2048);
  
  // Create a certificate
  console.log('Step 2: Creating self-signed certificate...');
  const cert = forge.pki.createCertificate();
  
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'KaarTech' },
    { shortName: 'OU', value: 'Customer Portal' }
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2, // DNS
          value: 'localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        }
      ]
    }
  ]);
  
  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  // Convert to PEM format
  console.log('Step 3: Converting to PEM format...');
  const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
  const pemCert = forge.pki.certificateToPem(cert);
  
  // Write to files
  console.log('Step 4: Writing certificate files...');
  fs.writeFileSync('server.key', pemKey);
  fs.writeFileSync('server.cert', pemCert);
  
  console.log('\n✓ SSL certificates generated successfully!');
  console.log('  - server.key (private key)');
  console.log('  - server.cert (certificate)');
  console.log('  - Valid for 1 year');
  console.log('  - Common Name: localhost');
  console.log('\nNote: This is a self-signed certificate for development only.');
  console.log('Your browser will show a security warning - this is expected.');
  
} catch (error) {
  console.error('\n✗ Error generating certificates:', error.message);
  process.exit(1);
}
