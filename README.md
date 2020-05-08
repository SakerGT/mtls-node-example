# Mutual TLS and certificate validation checks

This project uses Node JS server and client to demonstrate mTLS and validation of additional certificate properties.

There are 4 exercises to demonstrate mutual authentication certificate checks that can be done:

1. [Trusted issuer](basic/README.md)
2. [Common Name check](common-name/README.md)
3. [Public key fingerprint](public-key-fingerprint/README.md)
4. [Certificate fingerprint](certificate-fingerprint/README.md)

The below gives some context and motivation for use of mTLS and these examples.  Also included is instructions for generating your own dummy CA and certificates should you wish to.

Contributions are encouraged, please see the [contribution guidelines.](./CONTRIBUTING.md)

## Overview

This project demonstrates the creation of mutual trust between client and server, using a shared certificate authority (CA).  The CA is trusted by both client and server, and both use certificates that are signed by the CA.  The certificates are used to establish identity between client and server (authenticate their respective identities).

The following shows this in an abstract way:

![CA-overview](https://plantuml.somerfield.co.nz/png/0/bLHDQy904BtdLsnLw2bwABs8Y5Qabr8AqfjGrcIYIvBTi3k9IEb_x-mcQTOlj1vqChutRzxR93E3N6EPPq7m86IKbJ6m2PO5Z_NJA59vhkJqmZ-9aXZoFHYLG_WyYZdo3JSmB6ZI7VW8D8f4H1plfgHmQA31Ool7UfD1Mq-N4a4NMb1xMO54qsFSi9GdAMVz_KuW146YUKwiHIVFvYNkb1PuSF35d7q7Z3w9o2nmphnLrt8oy2wdZX5nssBzDx7TuOfd5DZn05gfia9am0wWdvP8vJ7lfzim4sIXnhcoMOjEf53INlS-3MWstxOmRgjctAi6EDhYbWSduVau7V1npOCZTZxEXE_8xolYv-dLRiBGM-rIdvJzTWO9XjDwv9YXBWrwcQv0Lw2Tg77bUQOM8YAeCLNKxFMIbV2FDElXNfed_6jXrhmkp5FPsrcQYrbQ8vHOjzPvjytHDRNbKupc94RlBWb36xExWSTi9ROIOhOv19xpAuZwe2PsEacDsJlWNkdKda5kZYI6mnQpiXHoLsYbahLKIVj8Y9Y-wSdrTIsj5hb4RCxzZpW36TCxvHS0 "CA-overview")

### Motivation

You may be wondering what the point of this is?  Well, mTLS is really the only way to be certain (well, relatively certain) that the network path is as intended - that the communicating partners are in fact, who they claim to be.

The following shows the relative strengths of checks that can be performed using mTLS:

![X.509 Certificate Verification Strength](https://plantuml.somerfield.co.nz/png/0/TL9DJyCm3BtdLrX3Wii-k73WCaqg0Y6cCL4477R9KgyDIvCeSTd6hyVzs5OXkDJrotlFiPrP91ceAesuChWX80T1vmL1fWCgqiuAGPeCmiVuvleM4WoaDrf9GdZ3qFuo2r8AQ7CgXAXrqkOi6TnNne3gIKf9gbZPlij6sno33zhI06I4WijZfBxDibeRhM2BXp_PVMhVsJjMQOmh-yJAgByHBe4E7bSsrRcLL0K4QJCeP2n0cfoPI6eyRfnBp7wRfzNwapEuMqoIHTlBaQghyhzhl0PfevSy7dK0LQ3QSftd95toRPANUGSTZOpRzOqUOwmmJ5GXjHs2TGIuzxoQR0Y-2jv5R8IrgYzxHxdb8S84IiV1OoXrZFghPU-wqujvlUfKcfBNtE-JWkCnd_NAbTxWlX77qs4hVmY8_4YwjS5eD6sNKd-Qx3Z8BXundXY8BdOGTz50TQoX9ZyvZwVdsg8-Og3hH8WPsenVyGy0 "X.509 Certificate Verification Strength")

## Dependencies

Ensure you have an install of:

* NodeJS 10 or later
* OpenSSL command line tools
  
## Setup

### Create a CA

`openssl req -new -x509 -days 3650 -keyout ca-key.pem -out ca-crt.pem`

Password defaults to `cap@ssword*&`.  Uses `democa.tlsdemo.co.nz` for FQDN.

### Prepare certificates

#### Server certificate

Generate Server Key:

`openssl genrsa -out server-key.pem 4096`

Generate Server certificate signing request:

`openssl req -new -key server-key.pem -out server-csr.pem`

Specify server Common Name, like 'localhost' or 'server.localhost'. The client will verify this, so make sure you have a valid DNS name for this.
For this example, do not set the challenge password.

Sign certificate using the CA:

`openssl x509 -req -days 90 -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem`

* insert CA Password

Verify server certificate:

`openssl verify -CAfile ca-crt.pem server-crt.pem`

Generate server certificate public key ping-sha256 (works in Linux / Mac only):

`openssl x509 -in server\-crt.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64`

Get server certificate fingerprint:

`openssl x509 -noout -fingerprint -sha256 -inform pem -in server-crt.pem`

#### Client certificate

Generate Client Key:

`openssl genrsa -out client1-key.pem 4096`

Generate Client certificate signing request:

`openssl req -new -key client1-key.pem -out client1-csr.pem`

Specify client Common Name, like 'client.localhost'. Must be a valid DNS name for this example.

Sign certificate using the CA:

`openssl x509 -req -days 90 -in client1-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out client1-crt.pem`

* insert CA Password

Verify client certificate:

`openssl verify -CAfile ca-crt.pem client1-crt.pem`

Generate client certificate public key pin-sha256 (works in Linux / Mac only):

`openssl x509 -in client1-crt.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64`

Get client certificate fingerprint:

`openssl x509 -noout -fingerprint -sha256 -inform pem -in client1-crt.pem`

## Testing with node

First run the server:

`node server.js`

Then run the client

`node client.js`

Adjust any of the tests in the body of the code to confirm behaviour

## Testing server with curl

From the `CA` directory:

`curl -v --cacert ca-crt.pem --cert client1-crt.pem --key client1-key.pem -k https://localhost:8000`
