import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly provider;
    private readonly localBasePath;
    private readonly s3Client;
    private readonly s3Bucket;
    constructor(configService: ConfigService);
    uploadFile(filename: string, buffer: Buffer, organizationId: string): Promise<string>;
    getFileBuffer(storageKey: string): Promise<Buffer>;
    deleteFile(storageKey: string): Promise<void>;
    getFilePath(storageKey: string): string;
}
