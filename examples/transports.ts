///  <reference types="node"/>
// TODO:
// - HTTP connection
// - Proxies: HTTP Connect, SOCKS
// - Delegate to subprocess. Show with obsf4

import * as crypto from 'crypto';
import * as net from 'net';
import * as zlib from 'zlib';
import * as model from './model';

export function newTcpSocket(options: any, connectCallback: Function): model.Socket {
  const socket = net.createConnection(options, connectCallback) as model.TwoWayStream;
  return new model.Socket(socket, socket);
}

// TODO: Flush on new line
export function newEncryptedAdaptor(cipher: string, password: string): model.Adaptor {
  return new model.Adaptor(() => crypto.createCipher(cipher, password),
                           () => crypto.createDecipher(cipher, password));
}

// TODO: Flush on new line
export function newGzipAdaptor(): model.Adaptor {
  return new model.Adaptor(() => zlib.createGzip(), () => zlib.createGunzip());
}

export class NetTcpClient implements model.TcpClient {
  connect(options: {host: string, port: number}, connectCallback: Function): model.Socket {
    const socket = net.createConnection(options, connectCallback) as model.TwoWayStream;
    return new model.Socket(socket, socket);
  }
}

export class AdaptedTcpClient implements model.TcpClient {
  constructor(private adaptor: model.Adaptor, private baseConnector: model.TcpClient) {}
  connect(options: {host: string, port: number}, connectCallback: Function): model.Socket {
    const socket = this.baseConnector.connect(options, connectCallback);
    return this.adaptor.bindSocket(socket);
  }
}