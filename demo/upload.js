import { resolve } from "path"
import minimist from "minimist"
import fse from "fs-extra"
import upload from "../index.js"

const args = minimist(process.argv.slice(2))

const buildMode = args.mode

const cosMap = {}
const COS_BASE = "camin/"
const cwd = resolve("dist")

// h5-static-cos.json 里是资源上传的 COS 的参数，使用该插件时需自行替换成自己 COS 的参数
const cosFile = resolve("./h5-static-cos.json")

if (fse.existsSync(cosFile)) {
  try {
    const datas = fse.readJsonSync(cosFile)
    Object.assign(
      cosMap,
      datas.cosMap[buildMode],
      {
        SecretId: datas.SecretId,
        SecretKey: datas.SecretKey,
      }
    )
  } catch (err) {}
}

upload({
  cosBase: `${COS_BASE}assets/`,
  cwd: resolve(cwd, "assets"),
  backup: "",
  ...cosMap,
}).then(() => {
  console.log("----finish 1")
})




const files = fse.readdirSync(cwd).filter(name => (!(/assets$/).test(name)))

files.forEach(async (folder) => {
  upload({
    cosBase: `${COS_BASE}${folder}/`,
    cwd: resolve(cwd, folder),
    backup: "",
    ...cosMap,
  }).then(() => {
    console.log("----finish 2")
  })

  // upload({
  //   cosBase: `${COS_BASE}backup/${version}/${folder}/`,
  //   cwd: resolve(cwd, folder),
  //   ...cosMap,
  // })
})

