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
  key: fs.readFileSync('CA/client1-key.pem'),
  cert: fs.readFileSync('CA/client1-crt.pem'),
  ca: fs.readFileSync('CA/ca-crt.pem'),

  checkServerIdentity: function(host, cert) {
    // Make sure the certificate is issued to the host we are connected to
    //const err = tls.checkServerIdentity(host, cert);
    const err = tls.checkServerIdentity("server1.somerfield.co.nz", cert);
    if (err) {
      return err;
    }
    

    // Pin the public key, similar to HPKP pin-sha25 pinning
    const pubkey256 = 'gFFZngjE27Qt5xEYR8D3l494t8aSPuDRH0cRziiYmVI=';
    if (sha256(cert.pubkey) !== pubkey256) {
      const msg = 'Certificate verification error: ' +
        `The public key of '${cert.subject.CN}' ` +
        'does not match our pinned fingerprint';
      return new Error(msg);
    }

    // Pin the exact certificate, rather than the pub key
    const cert256 = '75:83:E3:23:49:2C:8E:74:36:9C:70:3D:66:' +
        'E1:58:F0:ED:E8:91:8D:50:C2:8E:A9:2F:38:BD:4B:56:E7:B3:49';
    if (cert.fingerprint256 !== cert256) {
      const msg = 'Certificate verification error: ' +
        `The certificate of '${cert.subject.CN}' ` +
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
      console.log('  Public key ping-sha256:', sha256(cert.pubkey));

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