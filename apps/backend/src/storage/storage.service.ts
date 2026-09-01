import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: string;
  private readonly localBasePath: string;
  private readonly s3Client: S3Client | null = null;
  private readonly s3Bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('STORAGE_PROVIDER') || 'local';
    this.localBasePath = this.configService.get<string>('STORAGE_LOCAL_PATH') || './uploads';
    this.s3Bucket = this.configService.get<string>('S3_BUCKET') || 'okf-documents';

    if (this.provider === 's3') {
      const endpoint = this.configService.get<string>('S3_ENDPOINT');
      const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
      const secretKey = this.configService.get<string>('S3_SECRET_KEY');
      const region = this.configService.get<string>('S3_REGION') || 'auto';

      if (!accessKey || !secretKey) {
        throw new Error(
          'S3_ACCESS_KEY and S3_SECRET_KEY must be set when STORAGE_PROVIDER=s3',
        );
      }

      this.s3Client = new S3Client({
        region,
        ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });

      this.logger.log(`StorageService: using S3/R2 provider. Bucket: ${this.s3Bucket}, Endpoint: ${endpoint || 'AWS default'}`);
    } else {
      // Local filesystem storage
      if (!fs.existsSync(this.localBasePath)) {
        fs.mkdirSync(this.localBasePath, { recursive: true });
      }
      this.logger.log(`StorageService: using local storage at ${this.localBasePath}`);
    }
  }

  async uploadFile(filename: string, buffer: Buffer, organizationId: string): Promise<string> {
    const key = `${organizationId}/${Date.now()}-${filename}`;

    if (this.provider === 's3' && this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
          Body: buffer,
          ContentType: 'application/pdf',
        }),
      );
      this.logger.log(`Uploaded file to S3/R2: ${key}`);
    } else {
      // Local fallback
      const orgDir = path.join(this.localBasePath, organizationId);
      if (!fs.existsSync(orgDir)) {
        fs.mkdirSync(orgDir, { recursive: true });
      }
      const filePath = path.join(this.localBasePath, key);
      await fs.promises.writeFile(filePath, buffer);
      this.logger.log(`Stored file locally at ${filePath}`);
    }

    return key;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    if (this.provider === 's3' && this.s3Client) {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: storageKey,
        }),
      );

      const stream = response.Body as Readable;
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } else {
      const filePath = path.join(this.localBasePath, storageKey);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at storage key: ${storageKey}`);
      }
      return fs.promises.readFile(filePath);
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (this.provider === 's3' && this.s3Client) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.s3Bucket,
          Key: storageKey,
        }),
      );
      this.logger.log(`Deleted file from S3/R2: ${storageKey}`);
    } else {
      const filePath = path.join(this.localBasePath, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Deleted local file: ${filePath}`);
      }
    }
  }

  getFilePath(storageKey: string): string {
    if (this.provider === 's3') {
      // For S3, there's no "local path". Return a placeholder.
      return storageKey;
    }
    return path.resolve(this.localBasePath, storageKey);
  }
}
