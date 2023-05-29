interface IOption {
  Bucket: string
  Region: string
  AppId: string
}

interface IUpload extends IOption {
  cosBase: string
  SecretId: string
  SecretKey: string
  cwd?: string
}

declare const upload: (option: IUpload) => void;
export default upload;
