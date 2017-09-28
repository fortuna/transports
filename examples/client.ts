///  <reference types="node"/>

import * as stream from 'stream';

import * as model from './model';
import * as transports from './transports';

function main(argv: string[]) {
  const tcpConnection = transports.newTcpSocket({port: 8080, host: 'localhost'}, () => {
    console.log('Connected to server via TCP!');
  })
  //const cryptoConnection = transports.newEncryptedAdaptor('aes192', 'a password')
  const cryptoConnection = transports.newGzipAdaptor()
      .bindSocket(tcpConnection);

  cryptoConnection.writeStream.on('end', () => {
    console.log("Session done");
    process.exit();
  });
  cryptoConnection.readStream.on('end', () => {
    console.log("Server disconnected");
    process.exit();
  });
  //connection.on('error', (error) => console.error(error));
  new model.Socket(process.stdin, process.stdout).bind(cryptoConnection);
}

main(process.argv);
