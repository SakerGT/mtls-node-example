const tls = require("tls");
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const { Console } = require("console");

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("base64");
}
const options = {
  hostname: "localhost",
  port: 8000,
  path: "/",
  method: "GET",
  key: fs.readFileSync("../CA/client1-key.pem"),
  cert: fs.readFileSync("../CA/client1-crt.pem"),
  ca: fs.readFileSync("../CA/ca-crt.pem"),

  checkServerIdentity: function (host, cert) {
    // Make sure the certificate is issued to the host we are connected to
    if (!cert.subjectaltname) { return undefined }

    // Note the format here is defined in RFC 5280 and RFC 4985
    // Acceptable alt names:
    // const altNames = [ "DNS:www.demoservers.co.nz" ]
    // incorrect alt names:
    const altNames = [ "DNS:incorrect.url.co.nz", "IP:127.0.0.1" ]
    
    // get certificate subject alternative names
    const certAltNames = cert.subjectaltname.split(",");

    // see if any acceptable alt names appear in the certificate
    const err = certAltNames.some( r => altNames.indexOf(r) >= 0)

    if (!err) {
      console.log(
        "Server certificate does not contain the expected subject alternative name, exiting"
      );
      return err;
    }

    // This loop is informational only.
    // Print the certificate and public key fingerprints of all certs in the
    // chain. Its common to pin the public key of the issuer on the public
    // internet, while pinning the public key of the service in sensitive
    // environments.
    do {
      console.log("Subject Common Name:", cert.subject.CN);
      console.log("  Certificate SHA256 fingerprint:", cert.fingerprint256);
      if (cert.subjectaltname) {
        console.log("  Subject Alternative Name(s):", cert.subjectaltname);
      }

      hash = crypto.createHash("sha256");
      console.log("  Public key pin-sha256:", sha256(cert.pubkey));
      console.log("  Key bits:", cert.bits);
      console.log("  Valid from:", cert.valid_from);
      console.log("  Valid to:  ", cert.valid_to);

      lastprint256 = cert.fingerprint256;
      cert = cert.issuerCertificate;
    } while (cert.fingerprint256 !== lastprint256);
  },
};

options.agent = new https.Agent(options);
const req = https.request(options, (res) => {
  console.log("All OK. Server matched our pinned Subject CN");
  console.log("statusCode:", res.statusCode);
  // Print the HPKP values
  console.log("headers:", res.headers["public-key-pins"]);

  res.on("data", (d) => {
    console.log("Server data:", d.toString());
  });
});

req.on("error", (e) => {
  console.error(e.message);
});
req.end();
