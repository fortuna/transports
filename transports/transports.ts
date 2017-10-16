///  <reference types="node"/>
// TODO:
// - SOCKS proxy
// - Example with obsf4
// - HTTP proxy https://nodejs.org/api/http.html#http_event_connect
// - HTTP request over socket
// - newServiceAdaptor
//
// App TODO:
// - Handle encrypt/decrypt errors
// - Use line buffering

import * as child_process from 'child_process';
import * as crypto from 'crypto';
import * as net from 'net';
import * as stream from 'stream';
import * as zlib from 'zlib';
import * as model from './model';

// ======================================
// STREAMS
// ======================================

// Converts a Readable and Writable Node.JS stream to our model Stream.
export function streamFromNode(stream: NodeJS.ReadableStream & NodeJS.WritableStream): model.Stream {
  return new model.Stream(stream, stream);
}

// Starts a process running the given command and returns a Stream for its standard IO.
export function childProcessStream(command: string, args?: string[]): model.Stream {
  const childProcess = child_process.spawn(command, args);
  return new model.Stream(childProcess.stdout, childProcess.stdin);
}

// ======================================
// ADAPTORS
// ======================================

export function newPassThroughAdaptor() {
  return new model.Adaptor(() => streamFromNode(new stream.PassThrough()),
                           () => streamFromNode(new stream.PassThrough()));
}

// TODO: Flush on new line
export function newEncryptedAdaptor(cipher: string, password: string): model.Adaptor {
  return new model.Adaptor(() => streamFromNode(crypto.createCipher(cipher, password)),
                           () => streamFromNode(crypto.createDecipher(cipher, password)));
}

// TODO: Flush on new line
export function newGzipAdaptor(): model.Adaptor {
  return new model.Adaptor(() => streamFromNode(zlib.createGzip()),
                           () => streamFromNode(zlib.createGunzip()));
}

// Creates an Adaptor where the forward and reverse streams will come from
// the standard input and output of the given commands.
export function newCommandAdaptor(forwardStreamCmd: string, reverseStreamCmd: string) {
  return new model.Adaptor(() => childProcessStream(forwardStreamCmd),
                           () => childProcessStream(reverseStreamCmd));
}

// A gzip adaptor that uses an external gzip/gunzip tool.
export function newExternalGzipAdaptor(): model.Adaptor {
  return newCommandAdaptor('gzip', 'gunzip');
}

// Creates an Adaptor that talks to two services to convert the forward and reverse streams.
export function newServiceAdaptor(forwardStreamService: {host: string, port: number}, reverseStreamService: {host: string, port: number}) {
  const forwardStreamClient = new DirectTcpClient();
  const reverseStreamClient = new DirectTcpClient();
  // TODO: Check for connection errors and buffer while connecting.
  return new model.Adaptor(() => forwardStreamClient.connect(forwardStreamService, ()=>{}),
                           () => reverseStreamClient.connect(reverseStreamService, ()=>{}));
}

class Base64EncodeStream extends stream.Transform {
  _transform(decoded: Buffer, unusedEncoding: string, callback: (error: Error | null, data: string) => {}) {
    callback(null, decoded.toString('base64'));
  }
}

class Base64DecodeStream extends stream.Transform {
  _transform(encoded: string, unusedEncoding: string, callback: (error: Error | null, data: Buffer) => {}) {
    callback(null, new Buffer(encoded, 'base64'));
  }
}

// Creates an Adaptor that speaks base64. Useful for testing to looking into binary data.
// It's also an example of how to build your own streams.
export function newBase64Adaptor() {
  return new model.Adaptor(() => streamFromNode(new Base64EncodeStream()),
                           () => streamFromNode(new Base64DecodeStream()));
}

// ======================================
// Service connection support
// ======================================

// A ServiceClient that establishes a direct TCP connection to the target service.
export class DirectTcpClient implements model.ServiceClient {
  connect(options: {host: string, port: number}, connectCallback: Function): model.Stream {
    const socket = net.createConnection(options, connectCallback);
    return new model.Stream(socket as NodeJS.ReadableStream, socket);
  }
}

// A ServiceClient that adapts the server streams from another ServiceClient.
export class AdaptedServiceClient implements model.ServiceClient {
  constructor(private adaptor: model.Adaptor, private baseClient: model.ServiceClient) {}
  connect(options: {host: string, port: number}, connectCallback: Function): model.Stream {
    const tcpStream = this.baseClient.connect(options, connectCallback);
    return this.adaptor.adapt(tcpStream);
  }
}

// A ServiceServer that listens on TCP connections.
export class TcpServer implements model.ServiceServer {
  private server = net.createServer();
  private adaptor: model.Adaptor | null = null;
  constructor(private port: number, private hostname?: string) {}
  setAdaptor(adaptor: model.Adaptor): TcpServer {
    this.adaptor = adaptor;
    return this;
  }
  onConnection(handler: (socket: model.Stream) => void): void {
    this.server.on('connection', (netSocket: net.Socket) => {
      let socket = new model.Stream(netSocket as NodeJS.ReadableStream, netSocket);
      if (this.adaptor) {
        socket = this.adaptor.adapt(socket);
      }
      handler(socket);
    });
  }
  on(event: 'error' | 'data' | 'end', handler: Function) {
    this.server.on(event, handler);
  }
  listen() {
    this.server.listen(this.port, this.hostname);
  }
}
