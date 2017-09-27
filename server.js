const crypto = require('crypto');
var http = require('http');
var net = require('net');
var stream = require('stream');
var zlib = require('zlib');

var random_id = require('./random_id');

function newTcpTransport(socket) {
  return {
    readableStream: socket,
    writableStream: socket
  };
}

function newEncryptedTransport(cipher, password, lowerTransport) {
  writable = crypto.createCipher(cipher, password);
  writable.pipe(lowerTransport.writableStream);
  return {
    readableStream: lowerTransport.readableStream.pipe(crypto.createDecipher(cipher, password)),
    writableStream: writable
  };
}

function main() {
  var sockets = [];

  var server = net.createServer();

  server.on('connection', (tcpConnection) => {
    connection = newEncryptedTransport('aes192', 'a password', newTcpTransport(tcpConnection));

    // You can only get the host and port if you know it's a TCP stream.
    // const clientId = `${connection.remoteAddress}:${connection.remotePort}`;
    const clientId = random_id.randomId();

    console.log(`New Client: ${clientId}`);
    connection.writableStream.write(`Hello ${clientId}\n`);
    sockets.push(connection.writableStream);

    connection.readableStream.on('data', (data) => {
      process.stdout.write(`[${clientId}]: ${data}`);
      var len = sockets.length;
      for (otherSocket of sockets) {
        if (otherSocket && otherSocket != connection.writableStream) {
          otherSocket.write(`[${clientId}]: ${data}`);
        }
      }
    });

    connection.readableStream.on('end', () => {
      console.log(`Client ${clientId} left`);
      var idx = sockets.indexOf(connection.writableStream);
      if (idx != -1) {
        delete sockets[idx];
      }
    });
  });

  server.on('error', (error) => {
    console.error(error);
    throw error;
  });

  var svraddr = '127.0.0.1';
  var svrport = 8080;

  server.listen(svrport, svraddr);
  console.log('Server Created at ' + svraddr + ':' + svrport + '\n');
}

main()