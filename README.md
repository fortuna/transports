# Composable Transports

Playing with transports and APIs in a composable way.

# Concepts

You can find the interfaces for the core concepts at [transports/model.ts](transports/model.ts).

## Streams

A **Stream** is a unidirectional flow of data. It has two endpoints: you send data on the _write end_, and receive data on the _read end_.

Example of a GZip Stream:

```
write plain text ───> [ Gzip Stream ] ───> read gzipped text
````

You can think of a traditional network socket as a Stream:
```
write client data ───> [ Socket Stream ] ───> read server data
````

### Chaining Streams

You can chain multiple Streams:
```
write plain text ──> [ Gzip Stream ] ─> [ Encrypt Stream ] ──> read encrypted gzipped text
````

Notice that a chain of streams is also a Stream:
```
write plain text ──> [ Gzip + Encrypt Stream ] ──> read encrypted gzipped text
````

Rule:
> Stream + Stream = Stream


## Adaptors

An **Adaptor** converts the input and output of a Stream from one format to another, resulting in a Stream in the new format. In the example below, we adapt a Stream in format B, to a Stream in format A:

```
                     A <-> B Adaptor
                ┏━━━━━━━━━━━━━━━━━━━━━━━┓
write format A ─┃─> [ A -> B Stream ] ──┃─> write format B ↴
                ┃                       ┃           [ inner Stream ]
read format A <─┃── [ B -> A Stream ] <─┃── read format B  ↲
                ┗━━━━━━━━━━━━━━━━━━━━━━━┛
```

You can see an Adaptor as a pair of streams attached to both ends of the adapted stream, with one being the inverse transformation of the other.

As a real world example, you can imagine format B as being encrypted text, and format A as being plain text, in which case the Adaptor would attach a stream that encrypts text to the write end of the socket stream, and a stream that decrypts text to the read end of the socket stream.

```
                   Encryption Adaptor
                  ┏━━━━━━━━━━━━━━━━━┓
write plain text ─┃-> [ encrypt ] ──┃─> write encrypted text ↴
                  ┃                 ┃                [ Socket Stream ]
read plain text <─┃── [ decrypt ] <─┃── read encrypted text  ↲
                  ┗━━━━━━━━━━━━━━━━━┛
```

Rule:
> Stream + Adaptor = Stream

### Chaining Adaptors

You can chain multiple Adaptors:

```
          Compression Adaptor   Encryption Adaptor
        ┏━━━━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓
write  ─┃─> [  compress  ] ──┃─┃-> [ encrypt ] ──┃─┃->               ┃
        ┃                    ┃ ┃                 ┃ ┃  Socket Stream  ┃                     
read  <-┃── [ decompress ] <-┃─┃── [ decrypt ] <─┃─┃──               ┃
        ┗━━━━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛
```

Notice that the chain of Adaptors is also an Adaptor:
```
            Compression + Encryption Adaptor
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓
write  ─┃─> [  compress  ] ──-> [ encrypt ] ──┃─┃->               ┃
        ┃                                     ┃ ┃  Socket Stream  ┃                     
read  <-┃── [ decompress ] <-── [ decrypt ] <─┃─┃──               ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛
```

Rule:
> Adaptor + Adaptor = Adaptor


## Service connections

Service Clients connect to a host:port and, on connection, gives you a server Stream to write data to and read from the server.

Service Servers listen on a host:port and, on connection, gives you a client Stream to write data to and read from the client.

# Implementations

You can find multiple implementations for all those concepts at [transports/transports.ts](transports/transports.ts).
You can find examples using those implementations at [examples/](examples).

Building blocks:

Streams
* `childProcessStream`: Starts a subprocess and returns a Stream from its standard IO

Adaptors
* `newCommandAdaptor`: Creates an Adaptor using the `childProcessStreams` for the two input commands

Services
* `AdaptedServiceClient`: Allows you to adapt server Streams from an existing ServiceClient


Implementations:

Adaptors:
* newEncryptedAdaptor
* newGzipAdaptor
* newExternalGzipAdaptor

Services
* DirectTcpClient
* TcpServer
