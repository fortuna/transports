///  <reference types="node"/>

import * as stream from 'stream';

import * as model from '../transports/model';
import * as transports from '../transports/transports';

function createClientAdaptor(): model.Adaptor {
  if (!process.env['TRANSPORT_ADAPTOR']) {
    return transports.newPassThroughAdaptor();
  }
  const config = JSON.parse(process.env['TRANSPORT_ADAPTOR']) as transports.AdaptorConfigJson;
  return transports.newAdaptorFromConfig(config);
}

function main(argv: string[]) {
  const tcpClient: model.ServiceClient = new transports.AdaptedServiceClient(
    createClientAdaptor(), new transports.DirectTcpClient());

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
