package(default_visibility=["//visibility:public"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("//:defs.bzl", "ts_binary")

ts_binary(
    name = "chat_client",
    srcs = ["chat_client.ts"],
    deps = [
      "//transports:model",
      "//transports:transports",
    ],
    tsconfig = "//:tsconfig.json",
)

ts_binary(
    name = "chat_server",
    srcs = ["chat_server.ts"],
    deps = [
      "//transports:model",
      ":random_id",
      "//transports:transports",
    ],
    tsconfig = "//:tsconfig.json",
)

ts_library(
    name = "random_id",
    srcs = ["random_id.ts"],
    tsconfig = "//:tsconfig.json",
)
