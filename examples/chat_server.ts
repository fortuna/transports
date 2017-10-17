import * as model from '../transports/model';
import * as transports from '../transports/transports';
import * as random_id from './random_id';

process.on('uncaughtException', function(error: Error) {
  console.log(`Uncaught error ${error.name}: ${error.message}\n ${error.stack}`);
});

function main() {
  const clientStreams = [] as model.Stream[];

  const serverHost = '127.0.0.1';
  const serverPort = 8080;

  const server: model.ServiceServer = new transports.TcpServer(serverPort, serverHost)
      // .setAdaptor(transports.newGzipAdaptor());
   .setAdaptor(transports.newPassThroughAdaptor());
  //  .setAdaptor(transports.newEncryptedAdaptor('aes192', 'a password'));

  server.onConnection((clientStream: model.Stream) => {
    // You can only get the host and port if you know it's a TCP stream.
    // const clientId = `${connection.remoteAddress}:${connection.remotePort}`;
    const clientId = random_id.randomId();

    console.log(`New Client: ${clientId}`);
    clientStreams.push(clientStream);

    clientStream.readEnd.on('data', (data: string) => {
      process.stdout.write(`[${clientId}]: ${data}`);
      var len = clientStreams.length;
      // Broadcast message to all connected clients.
      for (let otherSocket of clientStreams) {
        if (otherSocket && otherSocket != clientStream) {
          otherSocket.writeEnd.write(`[${clientId}]: ${data}`);
        }
      }
    });
    const deleteConnection = () => {
      clientStream.writeEnd.end();
      var idx = clientStreams.indexOf(clientStream);
      if (idx != -1) {
        console.log(`Client ${clientId} left`);
        delete clientStreams[idx];
      }      
    };
    
    clientStream.onError((error: Error) => {
      console.error(`Client error: ${error.message}\n${error.stack}`);
      deleteConnection();
    })

    clientStream.readEnd.on('close', (had_error: boolean) => {
      console.log(`Socket closed (had_error = ${had_error})`);
      deleteConnection();
    });
    clientStream.readEnd.on('end', deleteConnection);
    clientStream.writeEnd.on('finish', deleteConnection);

    clientStream.writeEnd.write(`Hello ${clientId}\n`);   
  });

  server.on('error', (error: Error) => {
    console.error(`Server Error: ${error.message}\n${error.stack}`);
    throw error;
  });

  server.listen();
  console.log(`Server Created at ${serverHost}:${serverPort}\n`);
}

main()