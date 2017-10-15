package(default_visibility=["//visibility:public"])

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

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

ts_library(
    name = "transports_test",
    srcs = ["transports_test.ts"],
    deps = [
        ":model",
        ":transports",
    ],
    tsconfig = "//:tsconfig.json",
)

nodejs_binary(
    name = "transports_test_bin",
    data = [
        "@//:node_modules",
        ":transports_test",
    ],
    entry_point = "__main__/transports/transports_test.js",
)
