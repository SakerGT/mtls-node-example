const https = require('https');
const fs = require('fs');
const tls = require('tls');
const crypto = require('crypto');

function sha256(s) {
    return crypto.createHash('sha256').update(s).digest('base64');
}

const options = {

  key: fs.readFileSync('CA/server-key.pem'),
  cert: fs.readFileSync('CA/server-crt.pem'),
  ca: fs.readFileSync('CA/ca-crt.pem'),
  requestCert: true, // require certificate
  rejectUnauthorized: true, // must be signed by our CA
 
};

https.createServer(options, (req, res) => {
    const clientcert = req.socket.getPeerCertificate();

    const clientCN = 'client1.somerfield.co.nz';
    if(clientcert.subject.CN !== clientCN) {
        const msg = 'Certificate verification error: ' +
        `The common name of '${clientcert.subject.CN}' ` +
        'does not match our pinned common name';
      res.writeHead(401);
      res.end('Not authorised\n' + msg);
    }
    
    // Pin the public key
    const pubkey256 = 'CRNptV/Id+Qwu8+UR3MxHZpjK2hs5jBLyvg6RdrW3TE=';
    if (sha256(clientcert.pubkey) !== pubkey256) {
      const msg = 'Certificate verification error: ' +
        `The public key of '${clientcert.subject.CN}' ` +
        'does not match our pinned fingerprint';
      res.writeHead(401);
      res.end('Not authorised\n' + msg);
    }
    
    // Ping the exact client certificate
    //const cert256 = '75:83:E3:23:49:2C:8E:74:36:9C:70:3D:66:' +
    //   'E1:58:F0:ED:E8:91:8D:50:C2:8E:A9:2F:38:BD:4B:56:E7:B3:49';
    const cert256 = 'D4:C7:5E:88:CB:58:B0:23:10:EB:05:D0:6D:' + 
        '29:BD:78:91:2C:03:5F:7B:B0:8E:A4:62:9F:0F:C6:70:09:DD:5E';
    if (clientcert.fingerprint256 !== cert256) {
      const msg = 'Certificate verification error: ' +
        `The certificate of '${clientcert.subject.CN}' ` +
        'does not match our pinned fingerprint';
      res.writeHead(401);
      res.end('Not authorised\n' + msg);
    }

    console.log(new Date()+' '+ 
              req.connection.remoteAddress+' '+ 
              req.socket.getPeerCertificate().subject.CN+' '+ 
              req.method+' '+req.url);
    console.log('Subject Common Name:', clientcert.subject.CN);
    console.log('  Certificate SHA256 fingerprint:', clientcert.fingerprint256);
        
    hash = crypto.createHash('sha256');
    console.log('  Public key ping-sha256:', sha256(clientcert.pubkey));
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);
