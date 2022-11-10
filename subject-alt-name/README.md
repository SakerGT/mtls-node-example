# Subject common name

This example builds on the [basic](../basic/README.md) scenario, and adds:

* Client checks a static hostname (FQDN) string against server certificate Subject Alternative Names.
* Server checks a static hostname (FQDN) string against client certificate Subject CN (Common Name)

## Run the example to see failure

First run the server with `node server.js`

Secondly, run the client `node client.js`

The output should be a TLS handshake failure, where the client is rejecting the server as not matching the hostname expected.

## Update the client

Change the following code in `client.js`

```javascript
// const altNames = [ "DNS:www.demoservers.co.nz" ]
const altNames = [ "DNS:incorrect.url.co.nz", "IP:127.0.0.1" ]
```

to look like the following:

```javascript
const altNames = [ "DNS:www.demoservers.co.nz" ]
// const altNames = [ "DNS:incorrect.url.co.nz", "IP:127.0.0.1" ]
```

Save your change and re-run the client.  You should now have a different error, a HTTP 401 from the server.

## Update the server

The last step is update the server to accept the client subject CN.  Change the following in `server.js`

```javascript
const clientCN = "incorrect.demo.co.nz"
//const clientCN = 'client.demo.co.nz';
```

To look like:

```javascript
//const clientCN = "incorrect.demo.co.nz"
const clientCN = 'client.demo.co.nz';
```

Save your change and re-start the server, then re-run the client.  Everything should now work as expected, and a HTTP 200 is returned to the client.
