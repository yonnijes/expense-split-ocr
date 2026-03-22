import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_KEY');
    this.bucket = this.config.get<string>('SUPABASE_BUCKET') ?? 'ticket-images';

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
    }

    this.client = createClient(url, key);
  }

  async uploadImage(
    objectKey: string,
    file: Buffer,
    contentType: string,
  ): Promise<{ publicUrl: string; objectKey: string }> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(objectKey, file, { contentType, upsert: true });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectKey);

    return { publicUrl: data.publicUrl, objectKey };
  }

  async deleteImages(objectKeys: string[]): Promise<void> {
    if (!objectKeys.length) return;

    const { error } = await this.client.storage.from(this.bucket).remove(objectKeys);
    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }
}
