///  <reference types="node"/>

import * as events from 'events';

// Streams are unidrectional flows of data, with a write end and a read end.
export class Stream {
  private middleEvents = new events.EventEmitter();

  constructor(public readEnd: NodeJS.ReadableStream, public writeEnd: NodeJS.WritableStream) {}

  // Handles errors on any of the stream end.
  onError(handler: (error: Error) => void) {
    this.readEnd.on('error', handler);
    this.middleEvents.on('error', handler);
    this.writeEnd.on('error', handler);
  }

  // Connects the read end of this Stream to the write end of the other stream.
  chain(other: Stream): Stream {
    this.readEnd.pipe(other.writeEnd);
    const chainedStream = new Stream(other.readEnd, this.writeEnd);
    this.readEnd.on('error', chainedStream.middleEvents.emit)
    other.writeEnd.on('error', chainedStream.middleEvents.emit)
    // TODO: merge the chainedEvents...
    return chainedStream;
  }
}

// Adaptors converts the input and output of Streams to convert them to new data formats.
export class Adaptor {
  // TODO: Consider reverting to Node.JS Read/Write streams if we can
  // create one from separate read and write streams.
  constructor(private createDirectStream: () => Stream,
              private createReverseStream: () => Stream) {
  }

  // Chains this Adaptor with the other Adaptor to create a new combined adaptor.
  chain(other: Adaptor): Adaptor {
    const createDirectStream = () => {
      return this.createDirectStream().chain(other.createDirectStream());
    };
    const createReverseStream = () => {
      return other.createReverseStream().chain(this.createReverseStream());
    };
    return new Adaptor(createDirectStream, createReverseStream);
  }

  // Creates a new Stream that combines this Adaptor and the given Stream.
  adapt(innerStream: Stream): Stream {
    return this.createDirectStream().chain(innerStream).chain(this.createReverseStream());
  }
}

// Allows connections to a service running on a hostname:port.
export interface ServiceClient {
  connect(options: {host: string, port: number}, connectCallback: Function): Stream
}

// Runs a server accepting connections on a hostname:port.
export interface ServiceServer {
  onConnection(handler: (tcpStream: Stream) => void): void    
  on(event: 'error' | 'data' | 'end', handler: Function): void
  listen(): void
}
