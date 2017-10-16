load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

def ts_binary(name, srcs, deps, tsconfig):
  if len(srcs) != 1:
    fail("Expected exactly one file in srcs")

  ts_target_name = "%s_ts" % name
  ts_src_file = srcs[0]
  js_main_file = "%s.js" % ts_src_file.rsplit('.', 1)[0]

  ts_library(
      name = ts_target_name,
      srcs = [ts_src_file],
      deps = deps,
      tsconfig = tsconfig,
  )

  nodejs_binary(
      name = name,
      data = [
        "@//:node_modules",
        ":%s" % ts_target_name,
      ],
      entry_point = "__main__/%s/%s" % (native.package_name(), js_main_file)
  )
