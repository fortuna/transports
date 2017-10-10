///  <reference types="node"/>

// Sockets enable bi-directional communication by providing a ReadableStream to read the input
// and WritableStream to write the output.
export class Socket {
  constructor(public readStream: NodeJS.ReadableStream, public writeStream: NodeJS.WritableStream) {}
  bind(other: Socket): void {
    this.readStream.pipe(other.writeStream);
    other.readStream.pipe(this.writeStream);
  }
}

// A stream that is both readable and writable.
export type TwoWayStream = NodeJS.ReadableStream & NodeJS.WritableStream;

export class Adaptor {
  constructor(private createLeftToRight: () => TwoWayStream,
              private createRightToLeft: () => TwoWayStream) {
  }

// Bind to another Adaptor to create a new combined adaptor. 
bindAadptor(other: Adaptor): Adaptor {
    const combinedCreateLeftToRight = () => {
      return this.createLeftToRight().pipe(other.createLeftToRight());
    };
    const combinedCreateRightToLeft = () => {
      return other.createRightToLeft().pipe(this.createRightToLeft());
    }
    return new Adaptor(combinedCreateLeftToRight, combinedCreateRightToLeft);
  }

  // Bind to a Socket to create a new Socket with an adapted interface.
  bindSocket(socket: Socket): Socket {
    const leftToRight = this.createLeftToRight();
    leftToRight.pipe(socket.writeStream);
    return new Socket(socket.readStream.pipe(this.createRightToLeft()),
                      leftToRight);
  }
}

export interface TcpClient {
  connect(options: {host: string, port: number}, connectCallback: Function): Socket
}
