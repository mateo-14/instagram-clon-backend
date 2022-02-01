enum StorageService {
  Supabase,
}

export default interface UploadedFile {
  id: number;
  path: string;
  url: string;
  service: StorageService;
}
