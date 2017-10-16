package(default_visibility=["//visibility:public"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("//:defs.bzl", "ts_binary")

ts_library(
    name = "model",
    srcs = ["model.ts"],
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

ts_binary(
    name = "transports_test",
    srcs = ["transports_test.ts"],
    deps = [
        ":model",
        ":transports",
    ],
    tsconfig = "//:tsconfig.json",
)
