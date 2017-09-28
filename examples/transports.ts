///  <reference types="node"/>

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
  return new model.Adaptor(crypto.createCipher(cipher, password),
                           crypto.createDecipher(cipher, password));
}

// TODO: Flush on new line
export function newGzipAdaptor(): model.Adaptor {
  return new model.Adaptor(zlib.createGzip(), zlib.createGunzip());
}