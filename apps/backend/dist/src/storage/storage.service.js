"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.s3Client = null;
        this.provider = this.configService.get('STORAGE_PROVIDER') || 'local';
        this.localBasePath = this.configService.get('STORAGE_LOCAL_PATH') || './uploads';
        this.s3Bucket = this.configService.get('S3_BUCKET') || 'okf-documents';
        if (this.provider === 's3') {
            const endpoint = this.configService.get('S3_ENDPOINT');
            const accessKey = this.configService.get('S3_ACCESS_KEY');
            const secretKey = this.configService.get('S3_SECRET_KEY');
            const region = this.configService.get('S3_REGION') || 'auto';
            if (!accessKey || !secretKey) {
                throw new Error('S3_ACCESS_KEY and S3_SECRET_KEY must be set when STORAGE_PROVIDER=s3');
            }
            this.s3Client = new client_s3_1.S3Client({
                region,
                ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
                credentials: {
                    accessKeyId: accessKey,
                    secretAccessKey: secretKey,
                },
            });
            this.logger.log(`StorageService: using S3/R2 provider. Bucket: ${this.s3Bucket}, Endpoint: ${endpoint || 'AWS default'}`);
        }
        else {
            if (!fs.existsSync(this.localBasePath)) {
                fs.mkdirSync(this.localBasePath, { recursive: true });
            }
            this.logger.log(`StorageService: using local storage at ${this.localBasePath}`);
        }
    }
    async uploadFile(filename, buffer, organizationId) {
        const key = `${organizationId}/${Date.now()}-${filename}`;
        if (this.provider === 's3' && this.s3Client) {
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.s3Bucket,
                Key: key,
                Body: buffer,
                ContentType: 'application/pdf',
            }));
            this.logger.log(`Uploaded file to S3/R2: ${key}`);
        }
        else {
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
    async getFileBuffer(storageKey) {
        if (this.provider === 's3' && this.s3Client) {
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: this.s3Bucket,
                Key: storageKey,
            }));
            const stream = response.Body;
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        }
        else {
            const filePath = path.join(this.localBasePath, storageKey);
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found at storage key: ${storageKey}`);
            }
            return fs.promises.readFile(filePath);
        }
    }
    async deleteFile(storageKey) {
        if (this.provider === 's3' && this.s3Client) {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.s3Bucket,
                Key: storageKey,
            }));
            this.logger.log(`Deleted file from S3/R2: ${storageKey}`);
        }
        else {
            const filePath = path.join(this.localBasePath, storageKey);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                this.logger.log(`Deleted local file: ${filePath}`);
            }
        }
    }
    getFilePath(storageKey) {
        if (this.provider === 's3') {
            return storageKey;
        }
        return path.resolve(this.localBasePath, storageKey);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map