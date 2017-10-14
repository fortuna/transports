///  <reference types="node"/>
// TODO:
// - HTTP request over socket
// - Proxies: HTTP Connect, SOCKS
// - Example with obsf4
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

export function streamAsSocket(stream: model.TwoWayStream): model.Stream {
  return new model.Stream(stream, stream);
}

export function childProcessSocket(command: string): model.Stream {
  const childProcess = child_process.spawn(command);
  return new model.Stream(childProcess.stdout, childProcess.stdin);
}

// ======================================
// ADAPTORS
// ======================================

export function newPassThroughAdaptor() {
  return new model.Adaptor(() => streamAsSocket(new stream.PassThrough()),
                           () => streamAsSocket(new stream.PassThrough()));
}

// TODO: Flush on new line
export function newEncryptedAdaptor(cipher: string, password: string): model.Adaptor {
  return new model.Adaptor(() => streamAsSocket(crypto.createCipher(cipher, password)),
                           () => streamAsSocket(crypto.createDecipher(cipher, password)));
}

// TODO: Flush on new line
export function newGzipAdaptor(): model.Adaptor {
  return new model.Adaptor(() => streamAsSocket(zlib.createGzip()),
                           () => streamAsSocket(zlib.createGunzip()));
}

// Creates an Adaptor where the leftToRight and rightToLeft sockets will come from
// the standard input and output of the given commands.
export function newCommandAdaptor(leftToRightCmd: string, rightToLeftCmd: string) {
  return new model.Adaptor(() => childProcessSocket(leftToRightCmd),
                           () => childProcessSocket(rightToLeftCmd));
}

// A gzip adaptor that uses an external gzip/gunzip tool.
export function newExternalGzipAdaptor(): model.Adaptor {
  return newCommandAdaptor('gzip', 'gunzip');
}

// ======================================
// TCP Connection support
// ======================================

export class NetTcpClient implements model.TcpClient {
  connect(options: {host: string, port: number}, connectCallback: Function): model.Stream {
    const socket = net.createConnection(options, connectCallback) as model.TwoWayStream;
    return new model.Stream(socket, socket);
  }
}

export class AdaptedTcpClient implements model.TcpClient {
  constructor(private adaptor: model.Adaptor, private baseConnector: model.TcpClient) {}
  connect(options: {host: string, port: number}, connectCallback: Function): model.Stream {
    const socket = this.baseConnector.connect(options, connectCallback);
    return this.adaptor.bindSocket(socket);
  }
}

export class NetTcpServer implements model.TcpServer {
  private server = net.createServer();
  private adaptor: model.Adaptor | null = null;
  constructor(private port: number, private hostname?: string) {}
  setAdaptor(adaptor: model.Adaptor): NetTcpServer {
    this.adaptor = adaptor;
    return this;
  }
  onConnection(handler: (socket: model.Stream) => void): void {
    this.server.on('connection', (netSocket: net.Socket) => {
      let socket = new model.Stream(netSocket as model.TwoWayStream, netSocket);
      if (this.adaptor) {
        socket = this.adaptor.bindSocket(socket);
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
