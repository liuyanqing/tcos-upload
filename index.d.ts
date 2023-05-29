interface IUpload {
  cosBase: string
  AppId: string
  Bucket: string
  Region: string
  SecretId: string
  SecretKey: string
  cwd?: string
  retry?: boolean
}

declare const upload: (option: IUpload) => void;
export default upload;
