interface IOption {
  Bucket: string
  Region: string
  AppId: string
}

export interface IUpload extends IOption {
  cosBase: string
  SecretId: string
  SecretKey: string
  cwd?: string
}

export interface ISliceUpload extends IOption {
  Key: string
  FilePath: string
}

export type Callback = (filename: string) => Promise<void>
