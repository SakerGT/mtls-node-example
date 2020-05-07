# Basic trust

This example requires:

1. Server and Client have certificates
2. Certificate was issued by a trusted (specified) CA

## Running

Run the server and client as is to check behaviour:

```
node server.js

node client.js
```

The client should complain that there is a self-signed certificate in the chain.  This means we haven't yet established trust with our example CA.

## Trust the CA

In `client.js`, there is a line that looks like:

```javascript
//ca: fs.readFileSync('../CA/ca-crt.pem')
```

Uncomment that line, save and re run the client with `node client.js`.  Your client should now connect to the server, and should display information about the CA certificate, the server certificate and the HTTP request should succeed.

At this point, the client is trusting the server certificate (transitive trust via the specified CA), and encryption is established.  However, the client is 'anonymous' as far as the server is concerned, so server protection is relatively weak at this point.

## Server require client certificate

On the server, require the client to have a certificate.  Uncomment the following two lines in `server.js` and save:

```javascript
//requestCert: true, // require certificate
//rejectUnauthorized: true, // must be signed by our CA
```

Stop the server (if running) and re-start.  Then re-run the client.  The client will generate a protocol error; the server has requested a certificate but our client is not configured with one.  Do that now by uncommenting the following two lines in `client.js` and save:

```javascript
//key: fs.readFileSync('../CA/client1-key.pem'),
//cert: fs.readFileSync('../CA/client1-crt.pem')
```

Re-run the client.  You should see a success message, and both client and server print information about the certificates of the other.

Congratulations, you've done a basic mTLS setup!  At this point, the both server and client trust that each others identity, because of the trust with our CA.

Next we'll add some checks of certificate properties.
