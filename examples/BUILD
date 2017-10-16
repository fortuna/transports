package(default_visibility=["//visibility:public"])

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "chat_client",
    srcs = ["chat_client.ts"],
    deps = [
      "//transports:model",
      "//transports:transports",
    ],
    tsconfig = "//:tsconfig.json",
)

nodejs_binary(
    name = "chat_client_bin",
    data = [
        "@//:node_modules",
        ":chat_client",
    ],
    entry_point = "__main__/examples/chat_client.js",
)

ts_library(
    name = "chat_server",
    srcs = ["chat_server.ts"],
    deps = [
      "//transports:model",
      ":random_id",
      "//transports:transports",
    ],
    tsconfig = "//:tsconfig.json",
)

nodejs_binary(
    name = "chat_server_bin",
    data = [
        "@//:node_modules",
        ":chat_server",
    ],
    entry_point = "__main__/examples/chat_server.js",
)

ts_library(
    name = "random_id",
    srcs = ["random_id.ts"],
    tsconfig = "//:tsconfig.json",
)
