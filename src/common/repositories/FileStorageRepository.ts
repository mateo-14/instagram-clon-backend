import FileStorage, { FileData } from 'common/interfaces/FileStorage';

import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';

class FileStorageRepository implements FileStorage {
  async upload({ key, file }: FileData): Promise<void> {
    const { error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(key, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(error?.message);
  }

  async uploadMany(files: FileData[]): Promise<void> {
    await Promise.all(files.map((file) => this.upload(file)));
  }

  async deleteMany(keys: string[]): Promise<void> {
    await supabaseClient.storage.from(BUCKET_NAME).remove(keys);
  }
}

export default new FileStorageRepository();
