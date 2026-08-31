"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IngestionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const ingestion_service_1 = require("../ingestion.service");
let IngestionProcessor = IngestionProcessor_1 = class IngestionProcessor extends bullmq_1.WorkerHost {
    constructor(ingestionService) {
        super();
        this.ingestionService = ingestionService;
        this.logger = new common_1.Logger(IngestionProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing BullMQ Ingestion Job ${job.id} for document ${job.data.documentId}`);
        await this.ingestionService.processDocument(job.data.documentId);
    }
};
exports.IngestionProcessor = IngestionProcessor;
exports.IngestionProcessor = IngestionProcessor = IngestionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('pdf-ingestion'),
    __metadata("design:paramtypes", [ingestion_service_1.IngestionService])
], IngestionProcessor);
//# sourceMappingURL=ingestion.processor.js.map