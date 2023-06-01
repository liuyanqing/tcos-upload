#!/usr/bin/env node
import chalk from "chalk"
import COS from "cos-nodejs-sdk-v5"
import { relative, join } from "path"
import fs from "fs"

const requiredOption = ["SecretId", "SecretKey", "Bucket", "AppId", "Region"]

function getCosConf(extra) {
  const conf = {
    ...extra,
  }
  return conf
}

function upload(option) {
  const {
    // 上传到 COS 的路径
    cosBase = "",
    // 本地需要上传的文件目录
    cwd = "",
    // 本地需要上传的文件列表, 文件路径是相对于 cwd 目录
    files = [],
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

  let needUploadfileNum = 0
  let uploadedfileNum = 0
  let traverseEnd = false

  return new Promise((resolve) => {

    const uploadFiles = async (filePath, retry = true) => {
      try {
        const relativePath = relative(cwd, filePath)
        const data = await cosUploadFile(getCosConf({
          Key: `${cosBase}${relativePath}`,
          FilePath: filePath,
          ...restOption,
        }), cos)
        uploadedfileNum++
        checkFinish()

        console.log(`${chalk.green(`Uploaded successfully: ${data?.uploadData?.Location}`)}`)
      } catch (error) {
        if (retry) {
          uploadFiles(filePath, false)
          console.log(`${chalk.red(`${filePath} upload retry`)}`)
          return
        }
        uploadedfileNum++
        checkFinish()
        throw new Error(`${filePath} Uploaded failed: ${error.message}`)
      }
    }

    const checkFinish =() => {
      if (traverseEnd && needUploadfileNum === uploadedfileNum) {
        resolve()
      }
    }

    if (files instanceof Array && files.length) {
      files.forEach(async (target) => {
        const filePath = join(cwd, target)
        if ((await fs.promises.stat(filePath)).isFile()) {
          needUploadfileNum++
          uploadFiles(filePath, true)
        }
      })
    } else {
      walkCwd({
        cwd,
        onFile: (filePath) => {
          needUploadfileNum++
          uploadFiles(filePath, true)
        },
      })
    }

    traverseEnd = true
  })

}

function walkCwd({
  cwd = "",
  onFile,
}) {
  const dirList = fs.readdirSync(cwd, { withFileTypes: true })
  dirList.forEach(function(dirent) {
    const filePath = join(cwd, dirent.name)
    if (dirent.isFile()) {
      onFile(filePath)
      return
    }
    if (dirent.isDirectory()) {
      walkCwd({
        cwd: filePath,
        onFile,
      })
    }
  })
}

function cosUploadFile(conf, cos) {
  return new Promise((resolve, reject) => {
    cos.sliceUploadFile({
      Bucket: conf.Bucket,
      Region: conf.Region,
      Key: conf.Key,
      FilePath: conf.FilePath,
    }, (err, data) => {
      const upErr = new Error("Upload error.")
      if (err) {
        upErr.message = err
        if (err && err.error && err.error.Message) {
          upErr.message = err.error.Message
        }
        reject(upErr)
      } else if (data && data.statusCode === 200) {
        resolve({
          uploadData: data,
          uploaded: true,
        })
      } else {
        upErr.message = data
        reject(upErr)
      }
    })
  })
}

export default upload
