package(default_visibility=["//visibility:public"])

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