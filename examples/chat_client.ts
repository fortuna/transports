///  <reference types="node"/>

import * as stream from 'stream';

import * as model from '../transports/model';
import * as transports from '../transports/transports';

function main(argv: string[]) {
  const tcpClient: model.ServiceClient = new transports.AdaptedServiceClient(
    transports.newPassThroughAdaptor(), new transports.DirectTcpClient());
    // transports.newExternalGzipAdaptor(), new transports.DirectTcpClient());
    // transports.newGzipAdaptor(), new transports.NetTcpClient());
    // transports.newEncryptedAdaptor('aes192', 'a password'), new transports.NetTcpClient());
  //const tcpConnector = new transports.NetTcpClient();

  const connection = tcpClient.connect({port: 8080, host: 'localhost'}, () => {
    console.log('Connected to server via TCP!');
  })

  connection.writeEnd.on('end', () => {
    console.log("Session done");
    process.exit();
  });
  connection.readEnd.on('end', () => {
    console.log("Server disconnected");
    process.exit();
  });
  //connection.on('error', (error) => console.error(error));
  const standardIoStream = new model.Stream(process.stdin, process.stdout);
  standardIoStream.chain(connection).chain(standardIoStream);
}

main(process.argv);
