import * as net from 'net';

import * as model from './model';
import * as transports from './transports';
import * as random_id from './random_id';

function main() {
  var sockets = [] as model.Socket[];

  var server = net.createServer();

  server.on('connection', (tcpConnection: net.Socket) => {
    let connection = transports.newGzipAdaptor().bindSocket(
    // let connection = transports.newEncryptedAdaptor('aes192', 'a password').bindSocket(
        new model.Socket(tcpConnection as NodeJS.ReadableStream, tcpConnection));

    // You can only get the host and port if you know it's a TCP stream.
    // const clientId = `${connection.remoteAddress}:${connection.remotePort}`;
    const clientId = random_id.randomId();

    console.log(`New Client: ${clientId}`);
    connection.writeStream.write(`Hello ${clientId}\n`);
    sockets.push(connection);

    connection.readStream.on('data', (data: any) => {
      process.stdout.write(`[${clientId}]: ${data}`);
      var len = sockets.length;
      for (let otherSocket of sockets) {
        if (otherSocket && otherSocket != connection) {
          otherSocket.writeStream.write(`[${clientId}]: ${data}`);
        }
      }
    });

    connection.readStream.on('end', () => {
      console.log(`Client ${clientId} left`);
      var idx = sockets.indexOf(connection);
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