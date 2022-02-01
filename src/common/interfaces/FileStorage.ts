import UploadedFile from 'common/models/UploadedFile';

export type FileData = {
  key: string;
  file: Express.Multer.File;
};

export default interface FileStorage {
  uploadFile(file: FileData): Promise<void>;
  uploadFiles(files: Array<FileData>): Promise<void>;
  deleteFiles(files: Array<string>): Promise<void>;
}
