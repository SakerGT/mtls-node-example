const tls = require('tls');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('base64');
}
const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('../CA/client1-key.pem'),
  cert: fs.readFileSync('../CA/client1-crt.pem'),
  ca: fs.readFileSync('../CA/ca-crt.pem'),

  checkServerIdentity: function(host, cert) {
    // Make sure the certificate is issued to the host we are connected to
    //const err = tls.checkServerIdentity(host, cert);
    const err = tls.checkServerIdentity("www.demoservers.co.nz", cert);
    if (err) {
      return err;
    }
    
    // Pin the public key, similar to HPKP pin-sha25 pinning
    const pubkey256 = 'notvalid=`';
    //const pubkey256 = 'eD7cedEUCn6z3h9JREmUqL4Q8J7vx7M6wtq27T7/EIs=';
    if (sha256(cert.pubkey) !== pubkey256) {
      const msg = 'Certificate verification error: ' +
        `The public key of '${cert.subject.CN}' ` +
        'does not match our pinned fingerprint';
      return new Error(msg);
    }
    
    // This loop is informational only.
    // Print the certificate and public key fingerprints of all certs in the
    // chain. Its common to pin the public key of the issuer on the public
    // internet, while pinning the public key of the service in sensitive
    // environments.
    do {
      console.log('Subject Common Name:', cert.subject.CN);
      console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);

      hash = crypto.createHash('sha256');
      console.log('  Public key pin-sha256:', sha256(cert.pubkey));
      console.log('  Key bits:', cert.bits);
      console.log('  Valid from:',cert.valid_from);
      console.log('  Valid to:  ',cert.valid_to);

      lastprint256 = cert.fingerprint256;
      cert = cert.issuerCertificate;
    } while (cert.fingerprint256 !== lastprint256);

  },
};

options.agent = new https.Agent(options);
const req = https.request(options, (res) => {
  console.log('All OK. Server matched our pinned cert or public key');
  console.log('statusCode:', res.statusCode);
  // Print the HPKP values
  console.log('headers:', res.headers['public-key-pins']);

  res.on('data', (d) => {
    console.log('Server data:', d.toString());
  });

});

req.on('error', (e) => {
  console.error(e.message);
});
req.end();