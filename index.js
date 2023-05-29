#!/usr/bin/env node
import chalk from "chalk"
import COS from "cos-nodejs-sdk-v5"
import { relative, join } from "path"
import fse from "fs-extra"

const requiredOption = ["SecretId", "SecretKey", "Bucket", "AppId", "Region"]

function getCosConf(extra) {
  const conf = {
    // common conf
    ...extra
  }
  return conf
}

function upload(option) {
  const {
    cosBase = "",
    cwd = "",
    ...restOption
  } = option
  let conf = {
    SecretId: restOption.SecretId,
    SecretKey: restOption.SecretKey,
  }
  const cos = new COS(conf)
  requiredOption.forEach(key => {
    if (!option[key]) {
      throw new Error(`${key} is required!`)
    }
  })

  walkSync(cwd, async (fileName) => {
    try {
      const pathName = relative(cwd, fileName)
      const data = await uploadFile(getCosConf({
        Key: `${cosBase}${pathName}`,
        FilePath: fileName,
        ...restOption,
      }), cos)

      console.log(`${chalk.green(`Uploaded successfully: ${data?.uploadData?.Location}`)}`)
    } catch (error) {
      throw new Error(`${fileName} Uploaded failed: ${error}`)
    }
  })
}

function walkSync(currentDirPath = '', callback) {
  fse.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function(dirent) {
    var filePath = join(currentDirPath, dirent.name)
    if (dirent.isFile()) {
      callback(filePath)
    } else if (dirent.isDirectory()) {
      walkSync(filePath, callback)
    }
  })
}

function uploadFile(conf, cos) {
  return new Promise((resolve, reject) => {
    cos.sliceUploadFile({
      Bucket: conf.Bucket,
      Region: conf.Region,
      Key: conf.Key,
      FilePath: conf.FilePath,
    }, (err, data) => {
      let upErr = new Error("Upload error.")
      if (err) {
        upErr.message = err
        if (err && err.error && err.error.Message) {
          upErr.message = err.error.Message
        }
        reject(upErr)
      } else if (data && data.statusCode === 200) {
        resolve({
          uploadData: data,
          uploaded: true
        })
      } else {
        upErr.message = data
        reject(upErr)
      }
    })
  })
}

export default upload
