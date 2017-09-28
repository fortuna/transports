package(default_visibility=["//visibility:public"])

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "client",
    srcs = ["client.ts"],
    deps = [
      ":model",
      ":transports",
    ],
    tsconfig = "//:tsconfig.json",
)

nodejs_binary(
    name = "client_bin",
    data = [
        "@//:node_modules",
        ":client",
    ],
    entry_point = "__main__/examples/client.js",
)

ts_library(
    name = "model",
    srcs = ["model.ts"],
    tsconfig = "//:tsconfig.json",
)

ts_library(
    name = "random_id",
    srcs = ["random_id.ts"],
    tsconfig = "//:tsconfig.json",
)

ts_library(
    name = "transports",
    srcs = ["transports.ts"],
    deps = [
      ":model",
    ],
    tsconfig = "//:tsconfig.json",
)

ts_library(
    name = "server",
    srcs = ["server.ts"],
    deps = [
      ":model",
      ":random_id",
      ":transports",
    ],
    tsconfig = "//:tsconfig.json",
)

nodejs_binary(
    name = "server_bin",
    data = [
        "@//:node_modules",
        ":server",
    ],
    entry_point = "__main__/examples/server.js",
)