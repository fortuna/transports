///  <reference types="node"/>

// Sockets enable bi-directional communication by providing a ReadableStream to read the input
// and WritableStream to write the output.
export class Socket {
  constructor(public readStream: NodeJS.ReadableStream, public writeStream: NodeJS.WritableStream) {}
  bind(other: Socket): void {
    this.readStream.pipe(other.writeStream);
    other.readStream.pipe(this.writeStream);
  }
  pipe(other: Socket): Socket {
    this.readStream.pipe(other.writeStream);
    return new Socket(other.readStream, this.writeStream);
  }
}

// A stream that is both readable and writable.
export type TwoWayStream = NodeJS.ReadableStream & NodeJS.WritableStream;

export class Adaptor {
  // TODO: Consider reverting to Read/Write streams if we can
  // create one from a read and a write streams.
  constructor(private createLeftToRight: () => Socket,
              private createRightToLeft: () => Socket) {
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
  bindSocket(socket: Socket): Socket {
    return this.createLeftToRight().pipe(socket).pipe(this.createRightToLeft());
  }
}

export interface TcpClient {
  connect(options: {host: string, port: number}, connectCallback: Function): Socket
}

export interface TcpServer {
  onConnection(handler: (socket: Socket) => void): void    
  on(event: 'error' | 'data' | 'end', handler: Function): void
  listen(): void
}
