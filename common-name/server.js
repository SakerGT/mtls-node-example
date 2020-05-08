const https = require('https');
const fs = require('fs');
const tls = require('tls');
const crypto = require('crypto');

function sha256(s) {
    return crypto.createHash('sha256').update(s).digest('base64');
}

const options = {

  key: fs.readFileSync('../CA/server-key.pem'),
  cert: fs.readFileSync('../CA/server-crt.pem'),
  ca: fs.readFileSync('../CA/ca-crt.pem'),
  requestCert: true, // require certificate
  rejectUnauthorized: true, // must be signed by our CA
 
};

https.createServer(options, (req, res) => {
    const clientcert = req.socket.getPeerCertificate();

    const clientCN = "incorrect.demo.co.nz"
    //const clientCN = 'client.demo.co.nz';
    if(clientcert.subject.CN !== clientCN) {
        const msg = 'Certificate verification error: ' +
        `The common name of '${clientcert.subject.CN}' ` +
        'does not match our pinned common name\n';
      res.setHeader('Content-Type','text/plain');
      res.writeHead(401);
      res.end('Not authorised\n' + msg);
      return;
    }
    

    console.log(new Date()+' '+ 
              req.connection.remoteAddress+' '+ 
              req.socket.getPeerCertificate().subject.CN+' '+ 
              req.method+' '+req.url);
    console.log('Subject Common Name:', clientcert.subject.CN);
    console.log('Subject Organisational Unit', clientcert.subject.OU);
    console.log('  Certificate SHA256 fingerprint:', clientcert.fingerprint256);
        
    hash = crypto.createHash('sha256');
    console.log('  Public key ping-sha256:', sha256(clientcert.pubkey));
  
  res.setHeader('Content-Type','text/plain');
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);
