# Use Examples

## Pre-requisites

You need to [install Bazel](https://docs.bazel.build/versions/master/install.html).

Once Bazel is installed, install the NPM packages with:
```
bazel run @yarn//:yarn
```

## Chat Example

Build the chat client and server:
```
bazel build examples:chat_{client,server}
```

Run the server:
```
./bazel-bin/examples/chat_server
```

Run chat clients:
```
echo Hello all | ./bazel-bin/examples/chat_client
```
