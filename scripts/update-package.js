const fs = require("fs")
const path = require("path")
const srcPkg = require(path.resolve(process.cwd(), "src", "template.package.json"))
const rootPkg = require(path.resolve(process.cwd(), "package.json"))


srcPkg.version = rootPkg.version
srcPkg.dependencies = rootPkg.dependencies


fs.writeFileSync(
  path.resolve(process.cwd(), "dist", "package.json"),
  JSON.stringify(srcPkg, null, 2),
)
