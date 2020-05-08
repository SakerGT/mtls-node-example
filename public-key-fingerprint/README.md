# Public key fingerprint

This example expands on (and includes) the [common name](../common-name/README.md) checks, and adds the fingerprint of the public key to certificate checks

## Run the example

Running the example will fail, as the fingerprint is set to an incorrect value, you will see a message on the client informing that server public key failed checks.

## Modify the client

In `client.js`, modify the following

```javascript
const pubkey256 = 'notvalid=`';
//const pubkey256 = 'eD7cedEUCn6z3h9JREmUqL4Q8J7vx7M6wtq27T7/EIs=';
```

to look like:

```javascript
//const pubkey256 = 'notvalid=`';
const pubkey256 = 'eD7cedEUCn6z3h9JREmUqL4Q8J7vx7M6wtq27T7/EIs=';
```

and save, then re-run the client.  You should see a 401 HTTP failure code from the server.  The client has successfully validated the server, but the server has refused the client public key.

## Modify the server

In `server.js`, modify the following

```javascript
const pubkey256 = 'notvalid=';
//const pubkey256 = '1joByRA4/Q2CtythZpHm0LM6n+7a0/cLmQTafJ5JWF0=';
```

to look like:

```javascript
//const pubkey256 = 'notvalid=';
const pubkey256 = '1joByRA4/Q2CtythZpHm0LM6n+7a0/cLmQTafJ5JWF0=';
```

Save your code, re-start the server and re-run the client.  You should now see a success code.
