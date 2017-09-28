///  <reference types="node"/>

export class Socket {
  constructor(public readStream: NodeJS.ReadableStream, public writeStream: NodeJS.WritableStream) {}
  bind(other: Socket): void {
    this.readStream.pipe(other.writeStream);
    other.readStream.pipe(this.writeStream);
  }
}

export type TwoWayStream = NodeJS.ReadableStream & NodeJS.WritableStream;

export class Adaptor {
  constructor(public leftToRight: TwoWayStream,
              public rightToLeft: TwoWayStream) {
  }

  bindAadptor(other: Adaptor): Adaptor {
    this.leftToRight.pipe(other.leftToRight);
    other.rightToLeft.pipe(this.rightToLeft);
    return new Adaptor(this.leftToRight, other.rightToLeft);
  }

  bindSocket(socket: Socket): Socket {
    this.leftToRight.pipe(socket.writeStream);
    return new Socket(socket.readStream.pipe(this.rightToLeft),
                      this.leftToRight);
  }
}
