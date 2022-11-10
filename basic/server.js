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
  //requestCert: true, // require certificate
  //rejectUnauthorized: true, // must be signed by our CA
 
};

https.createServer(options, (req, res) => {
    const clientcert = req.socket.getPeerCertificate();

    

    console.log(new Date()+' '+ 
              req.socket.remoteAddress+' '+  
              req.method+' '+req.url);
    if(clientcert) {
      console.log('Client issuer:', clientcert.issuer);
      console.log('Client subject', clientcert.subject);
      
    }
  
  res.setHeader('Content-Type','text/plain');
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);
