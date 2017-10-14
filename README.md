# transports
Playing with transports and APIs

# Concepts

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


# Using Streams