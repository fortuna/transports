# Use Examples

## Pre-requisites

You need to [install Bazel](https://docs.bazel.build/versions/master/install.html).

Once Bazel is installed, install the NPM packages with:
```
bazel run @yarn//:yarn
```

## Chat Example

### Communicating directly in plain text

Build the chat client and server:
```
bazel build examples:chat_{client,server}
```

Run the server:
```
./bazel-bin/examples/chat_server
```

Run tcpdump to see the plain text traffic on the wire:
```
sudo tcpdump -An -i lo tcp and host localhost and port 8080
```

Run chat clients on different terminals and type some text:
```
./bazel-bin/examples/chat_client
```

You should see the text you typed on the tcpdump output

> Note: Some of the example Adaptors below buffer the input and output, so you you may need to type
enough text or close the stream (^D) to get it transferred.

### Adding an encyption Adaptor

You can specify the Adaptor to use via the `TRANSPORT_ADAPTOR` environment variable.

Restart the server:
```
TRANSPORT_ADAPTOR='{
  "encrypted": {"cipher": "aes-192-cdb", "secret": "asecret"}
}' ./bazel-bin/examples/chat_server
```

Restart the clients:
```
TRANSPORT_ADAPTOR='{
  "encrypted": {"cipher": "aes192-cbc", "secret": "asecret"}
}' ./bazel-bin/examples/chat_client
```

Type some text on the client. You won't see the plain text on tcpdump anymore.

Notice that if you enable the adaptor on the client, but not on the server, or if the encryption configs differ, you will see garbled text on the server output.

### Using an external binary as an adaptor.

It's possible to use external binaries as adaptors. You just need to specify the commands to do the forward and reverse transformations. The framework will start the commands for each new stream, and communication will happen via the standard I/O of the subprocess.

Let's use the `openssl` binary for encryption.

Restart the server:
```
TRANSPORT_ADAPTOR='{
  "streams":{
    "forward": {"process": {"command":["/usr/bin/openssl","aes-192-cbc","-pass","pass:asecret"]}},
    "reverse": {"process": {"command":["/usr/bin/openssl","aes-192-cbc","-d","-pass","pass:asecret"]}}
  }
}' ./bazel-bin/examples/chat_server
```

Restart the client:
```
TRANSPORT_ADAPTOR='{
  "streams":{
    "forward": {"process": {"command":["/usr/bin/openssl","aes-192-cbc","-pass", "pass:asecret"]}},
    "reverse": {"process": {"command":["/usr/bin/openssl","aes-192-cbc","-d","-pass","pass:asecret"]}}
  }
}' ./bazel-bin/examples/chat_client
```

### Using an external service as an adaptor.

This is not yet implemented, but we could also use a service running on a host:port as a Stream,
and join two of them to make an Adaptor. The config would look like:

```
TRANSPORT_ADAPTOR='{
  "streams":{
    "forward": {"service": {"host": "localhost", "port": "9090"}},
    "reverse": {"service": {"host": "localhost", "port": "9091"}}
  }
}'
```

### Using different implementations on client and server

Client and server may have different Adaptor implementations of the same protocol and still communicate.

In this example, the server uses the native gzip Adaptor:
```
TRANSPORT_ADAPTOR='{
  "gzip":{}
}' ./bazel-bin/examples/chat_server
```

While the client uses an Adaptor based on the gzip and gunzip commands:
```
TRANSPORT_ADAPTOR='{
  "streams":{
    "forward": {"process": {"command":["gzip"]}},
    "reverse": {"process": {"command":["gunzip"]}}
  }
}' ./bazel-bin/examples/chat_client
```

### Chaining adaptors

You can chain multiple adaptors with the "chain" configuration. You can try the configuration below and
use tcpdump to see both transformations (reverse case and reverse brackets) on the wire.

```
TRANSPORT_ADAPTOR='{
  "chain":[
    {
      "streams": {
        "forward": {"process": {"command": ["tr", "[:upper:][:lower:]", "[:lower:][:upper:]"]}},
        "reverse": {"process": {"command": ["tr", "[:lower:][:upper:]", "[:upper:][:lower:]"]}}
      }
    }, {
      "streams": {
        "forward": {"process": {"command": ["tr", "!{}[]()", "?}{][)("]}},
        "reverse": {"process": {"command": ["tr", "?}{][)(", "!{}[]()"]}}
      }
    }
  ]
}'
```
