const crypto = require('crypto');
var net = require('net');
var stream = require('stream');

// class Transport {
//   readableStream
//   writableStream
// }

function newTcpTransport(options, connectCallback) {
  const socket = net.createConnection({port: 8080, host: 'localhost'}, connectCallback);
  return {
    readableStream: socket,
    writableStream: socket
  }
}

function newEncryptedTransport(cipher, password, lowerTransport) {
  writable = crypto.createCipher(cipher, password);
  writable.pipe(lowerTransport.writableStream);
  return {
    readableStream: lowerTransport.readableStream.pipe(crypto.createDecipher(cipher, password)),
    writableStream: writable
  };
}

function main(argv) {
  const tcpConnection = newTcpTransport({port: 8080, host: 'localhost'}, () => {
    console.log('Connected to server via TCP!');
  })
  const cryptoConnection = newEncryptedTransport('aes192', 'a password', tcpConnection);

  cryptoConnection.writableStream.on('end', () => {
    console.log("Session done");
    process.exit();
  });
  cryptoConnection.readableStream.on('end', () => {
    console.log("Server disconnected");
    process.exit();
  });
  //connection.on('error', (error) => console.error(error));
  process.stdin.pipe(cryptoConnection.writableStream);
  cryptoConnection.readableStream.pipe(process.stdout);
}

main(process.argv);
