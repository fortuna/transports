import * as net from 'net';

import * as model from './model';
import * as transports from './transports';
import * as random_id from './random_id';

function main() {
  const sockets = [] as model.Stream[];

  const srvaddr = '127.0.0.1';
  const srvport = 8080;

  const server: model.TcpServer = new transports.NetTcpServer(srvport, srvaddr)
      .setAdaptor(transports.newGzipAdaptor());
  //  .setAdaptor(transports.newPassThroughAdaptor());
  //  .setAdaptor(transports.newEncryptedAdaptor('aes192', 'a password'));

  server.onConnection((connection: model.Stream) => {
    // You can only get the host and port if you know it's a TCP stream.
    // const clientId = `${connection.remoteAddress}:${connection.remotePort}`;
    const clientId = random_id.randomId();

    console.log(`New Client: ${clientId}`);
    connection.writeEnd.write(`Hello ${clientId}\n`);
    sockets.push(connection);

    connection.readEnd.on('data', (data: string) => {
      process.stdout.write(`[${clientId}]: ${data}`);
      var len = sockets.length;
      // Broadcast message to all connected clients.
      for (let otherSocket of sockets) {
        if (otherSocket && otherSocket != connection) {
          otherSocket.writeEnd.write(`[${clientId}]: ${data}`);
        }
      }
    });

    connection.readEnd.on('end', () => {
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