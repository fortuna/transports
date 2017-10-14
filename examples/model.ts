///  <reference types="node"/>

// Streams are unidrectional flows of data, with a write end and a read end.
export class Stream {
  constructor(public readEnd: NodeJS.ReadableStream, public writeEnd: NodeJS.WritableStream) {}

  // Connects the read end of this Stream to the write end of the other stream.
  pipe(other: Stream): Stream {
    this.readEnd.pipe(other.writeEnd);
    return new Stream(other.readEnd, this.writeEnd);
  }
}

// A stream that is both readable and writable.
export type TwoWayStream = NodeJS.ReadableStream & NodeJS.WritableStream;

export class Adaptor {
  // TODO: Consider reverting to Node.JS Read/Write streams if we can
  // create one from separate read and write streams.
  constructor(private createLeftToRight: () => Stream,
              private createRightToLeft: () => Stream) {
  }

  // Bind to another Adaptor to create a new combined adaptor. 
  bindAadptor(other: Adaptor): Adaptor {
    const createCombinedLeftToRight = () => {
      return this.createLeftToRight().pipe(other.createLeftToRight());
    };
    const createCombinedRightToLeft = () => {
      return other.createRightToLeft().pipe(this.createRightToLeft());
    };
    return new Adaptor(createCombinedLeftToRight, createCombinedRightToLeft);
  }

  // Bind to a Socket to create a new Socket with an adapted interface.
  bindSocket(socket: Stream): Stream {
    return this.createLeftToRight().pipe(socket).pipe(this.createRightToLeft());
  }
}

// Allows connections to a server on a hostname:port.
export interface TcpClient {
  connect(options: {host: string, port: number}, connectCallback: Function): Stream
}

// Runs a server accepting connections on a hostname:port.
export interface TcpServer {
  onConnection(handler: (socket: Stream) => void): void    
  on(event: 'error' | 'data' | 'end', handler: Function): void
  listen(): void
}
