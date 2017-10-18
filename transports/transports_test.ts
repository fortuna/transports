///  <reference types='node'/>
///  <reference types='jasmine'/>

import * as child_process from 'child_process';
import * as stream from 'stream';

import * as model from './model'
import * as transports from './transports'

function failOnError(eventEmitter: NodeJS.EventEmitter) {
  eventEmitter.on('error', (error: Error) => fail(error.message));
}

describe('newPassThroughAdaptor', function() {
  const nodeStream = new stream.PassThrough();
  failOnError(nodeStream);
  const innerStream = transports.streamFromNode(nodeStream);
  const adaptor = transports.newPassThroughAdaptor();
  const outerStream = adaptor.adapt(innerStream);

  it('can pass data through', function() {
    const DATA = 'DATA';
    expect(outerStream.writeEnd.write(DATA)).toBeTruthy();
    const read = outerStream.readEnd.read() as Buffer;
    expect(read).not.toBeNull();
    expect(read.toString()).toBe(DATA);
  });
});

describe('childProcessStream', function() {
  it('can talk to subprocess', function (done) {
    const stream = transports.childProcessStream(['tr', 'DAT', 'dat']);
    failOnError(stream.readEnd);
    failOnError(stream.writeEnd);
  
    const DATA = 'DATA';
    let buffer = '';
  
    stream.readEnd.on('readable', () => {
      let chunk;
      while (null !== (chunk = stream.readEnd.read())) {
        buffer += chunk;
      }
    });

    stream.readEnd.on('finish', () => {
      expect(buffer).toBe(DATA.toLowerCase())
      done();
    });
    expect(stream.writeEnd.write(DATA)).toBeTruthy();
    stream.writeEnd.end();
  });
});
