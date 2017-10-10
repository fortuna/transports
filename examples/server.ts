import * as net from 'net';

import * as model from './model';
import * as transports from './transports';
import * as random_id from './random_id';

function main() {
  const sockets = [] as model.Socket[];

  const srvaddr = '127.0.0.1';
  const srvport = 8080;

  const server = new transports.NetTcpServer(srvport, srvaddr);
  server.setAdaptor(transports.newGzipAdaptor());
  // server.setAdaptor(transports.newPassThroughAdaptor());
  // server.setAdaptor(transports.newEncryptedAdaptor('aes192', 'a password'));

  server.onConnection((connection: model.Socket) => {
    // You can only get the host and port if you know it's a TCP stream.
    // const clientId = `${connection.remoteAddress}:${connection.remotePort}`;
    const clientId = random_id.randomId();

    console.log(`New Client: ${clientId}`);
    connection.writeStream.write(`Hello ${clientId}\n`);
    sockets.push(connection);

    connection.readStream.on('data', (data: string) => {
      process.stdout.write(`[${clientId}]: ${data}`);
      var len = sockets.length;
      // Broadcast message to all connected clients.
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

  server.on('error', (error: Error) => {
    console.error(error);
    throw error;
  });

  server.listen();
  console.log('Server Created at ' + srvaddr + ':' + srvport + '\n');
}

main()