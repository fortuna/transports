///  <reference types="node"/>

import * as stream from 'stream';

import * as model from './model';
import * as transports from './transports';

function main(argv: string[]) {
  const tcpClient: model.TcpClient = new transports.AdaptedTcpClient(
    // transports.newPassThroughAdaptor(), new transports.NetTcpClient());
    transports.newExternalGzipAdaptor(), new transports.NetTcpClient());
    // transports.newGzipAdaptor(), new transports.NetTcpClient());
    // transports.newEncryptedAdaptor('aes192', 'a password'), new transports.NetTcpClient());
  //const tcpConnector = new transports.NetTcpClient();

  const connection = tcpClient.connect({port: 8080, host: 'localhost'}, () => {
    console.log('Connected to server via TCP!');
  })
  //const cryptoConnection = transports.newEncryptedAdaptor('aes192', 'a password')

  connection.writeStream.on('end', () => {
    console.log("Session done");
    process.exit();
  });
  connection.readStream.on('end', () => {
    console.log("Server disconnected");
    process.exit();
  });
  //connection.on('error', (error) => console.error(error));
  new model.Socket(process.stdin, process.stdout).bind(connection);
}

main(process.argv);
