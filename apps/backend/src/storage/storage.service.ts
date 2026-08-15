import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localBasePath: string;

  constructor(private readonly configService: ConfigService) {
    this.localBasePath = this.configService.get<string>('STORAGE_LOCAL_PATH') || './uploads';
    if (!fs.existsSync(this.localBasePath)) {
      fs.mkdirSync(this.localBasePath, { recursive: true });
    }
  }

  async uploadFile(filename: string, buffer: Buffer, organizationId: string): Promise<string> {
    const orgDir = path.join(this.localBasePath, organizationId);
    if (!fs.existsSync(orgDir)) {
      fs.mkdirSync(orgDir, { recursive: true });
    }

    const key = `${organizationId}/${Date.now()}-${filename}`;
    const filePath = path.join(this.localBasePath, key);

    await fs.promises.writeFile(filePath, buffer);
    this.logger.log(`Stored file locally at ${filePath}`);
    return key;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.localBasePath, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at storage key: ${storageKey}`);
    }
    return fs.promises.readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const filePath = path.join(this.localBasePath, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(`Deleted file at ${filePath}`);
    }
  }

  getFilePath(storageKey: string): string {
    return path.resolve(this.localBasePath, storageKey);
  }
}
