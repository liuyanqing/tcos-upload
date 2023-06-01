import { resolve } from "path"
import minimist from "minimist"
import fs from "fs"
import upload from "../index.js"

const args = minimist(process.argv.slice(2))

const buildMode = args.mode

const cosMap = {}
const COS_BASE = "camin/"
const cwd = resolve("demo/dist")

// h5-static-cos.json 里是资源上传的 COS 的参数，使用该插件时需自行替换成自己 COS 的参数
const cosFile = resolve("./h5-static-cos.json")

if (fs.existsSync(cosFile)) {
  try {
    const datas = JSON.parse(fs.readFileSync(cosFile, "utf8"))
    Object.assign(
      cosMap,
      datas.cosMap[buildMode],
      {
        SecretId: datas.SecretId,
        SecretKey: datas.SecretKey,
      }
    )
  // eslint-disable-next-line no-empty
  } catch (err) {}
}

upload({
  cosBase: `${COS_BASE}console/assets/1.2.0/`,
  cwd,
  ...cosMap,
}).then(() => {
  console.log("----finish 1")
})

upload({
  cosBase: `${COS_BASE}console/`,
  cwd,
  files: ["index.html"],
  ...cosMap,
}).then(() => {
  console.log("----finish 2")
})
