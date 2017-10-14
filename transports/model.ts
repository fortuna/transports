///  <reference types="node"/>

// Streams are unidrectional flows of data, with a write end and a read end.
export class Stream {
  constructor(public readEnd: NodeJS.ReadableStream, public writeEnd: NodeJS.WritableStream) {}

  // Connects the read end of this Stream to the write end of the other stream.
  chain(other: Stream): Stream {
    this.readEnd.pipe(other.writeEnd);
    return new Stream(other.readEnd, this.writeEnd);
  }
}

export class Adaptor {
  // TODO: Consider reverting to Node.JS Read/Write streams if we can
  // create one from separate read and write streams.
  constructor(private createLeftToRight: () => Stream,
              private createRightToLeft: () => Stream) {
  }

  // Chains another Adaptor to create a new combined adaptor. 
  chain(other: Adaptor): Adaptor {
    const createCombinedLeftToRight = () => {
      const leftStream = this.createLeftToRight();
      const rightStream = other.createLeftToRight();
      return leftStream.chain(rightStream);
    };
    const createCombinedRightToLeft = () => {
      const leftStream = this.createRightToLeft();
      const rightStream = other.createRightToLeft();
      return rightStream.chain(leftStream);
    };
    return new Adaptor(createCombinedLeftToRight, createCombinedRightToLeft);
  }

  // Bind to a Socket to create a new Socket with an adapted interface.
  bindSocket(socket: Stream): Stream {
    return this.createLeftToRight().chain(socket).chain(this.createRightToLeft());
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
