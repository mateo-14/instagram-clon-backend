import UploadedFile from 'common/models/UploadedFile';

export type FileData = {
  key: string;
  file: Express.Multer.File;
};

export default interface FileStorage {
  upload(file: FileData): Promise<void>;
  uploadMany(files: Array<FileData>): Promise<void>;
  deleteMany(files: Array<string>): Promise<void>;
}
