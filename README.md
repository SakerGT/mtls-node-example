# Mutual TLS and certificate pinning

This project uses Node JS server and client

## Dependencies

## Setup

### Creating a CA

`openssl req -new -x509 -days 3650 -keyout ca-key.pem -out ca-crt.pem`

Password defaults to `cap@ssword*&`.  Uses `democa.somerfield.co.nz` for FQDN.

### Prepare certificates

Generate Server Key:

`openssl genrsa -out server-key.pem 4096`

Generate Server certificate signing request:

`openssl req -new -key server-key.pem -out server-csr.pem`

Specify server Common Name, like 'localhost' or 'server.localhost'. The client will verify this, so make sure you have a valid DNS name for this.
For this example, do not insert the challenge password.

Sign certificate using the CA:

`openssl x509 -req -days 90 -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem`

* insert CA Password

Verify server certificate:

`openssl verify -CAfile ca-crt.pem server-crt.pem`

### Client certificate

Generate Client Key:

`openssl genrsa -out client1-key.pem 4096`

Generate Client certificate signing request:

`openssl req -new -key client1-key.pem -out client1-csr.pem`

Specify client Common Name, like 'client.localhost'. Must be a valid DNS name for this example

Sign certificate using the CA:

`openssl x509 -req -days 90 -in client1-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out client1-crt.pem`

* insert CA Password

Verify client certificate:

`openssl verify -CAfile ca-crt.pem client1-crt.pem`

## Testing with node

First run the server:

`node server.js`

Then run the client

`node client.js`

## Testing server with curl

From the `CA` directory:

```curl
curl -v --cacert ca-crt.pem --cert client1-crt.pem --key client1-key.pem -k https://localhost:8000
```
