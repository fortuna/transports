///  <reference types="node"/>

import * as chai from 'chai';
import * as child_process from 'child_process';
import * as stream from 'stream';

import * as model from './model'
import * as transports from './transports'

function runTests() {
  {
    console.log("[newPassThroughAdaptor]");
    const nodeStream = new stream.PassThrough();
    const innerStream = transports.streamFromNode(nodeStream);
    const adaptor = transports.newPassThroughAdaptor();
    const outerStream = adaptor.adapt(innerStream);

    const DATA = "DATA";
    chai.assert.isTrue(outerStream.writeEnd.write(DATA));
    const read = outerStream.readEnd.read()
    chai.assert.isNotNull(read, "Could not read from stream");
    chai.assert.equal(read, DATA);
  }

  {
    console.log("[childProcessStream]");
    const stream = transports.childProcessStream("tr", ["DAT", "dat"]);
    const DATA = "DATA";
    let buffer = "";

    stream.readEnd.on('readable', () => {
      let chunk;
      while (null !== (chunk = stream.readEnd.read())) {
        buffer += chunk;
      }
    });
    stream.readEnd.on('end', () => chai.assert.equal(buffer, DATA.toLowerCase()));
    chai.assert.isTrue(stream.writeEnd.write(DATA));
    stream.writeEnd.end();
  }
}

runTests();
