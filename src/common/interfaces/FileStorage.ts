export type FileData = {
  key: string;
  file: { mimetype: string; buffer: Buffer };
};

export default interface FileStorage {
  upload(file: FileData): Promise<void>;
  uploadMany(files: Array<FileData>): Promise<void>;
  deleteMany(files: Array<string>): Promise<void>;
}
