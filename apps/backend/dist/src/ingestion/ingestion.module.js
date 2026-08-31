"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const ingestion_service_1 = require("./ingestion.service");
const ingestion_processor_1 = require("./workers/ingestion.processor");
const pdf_extractor_service_1 = require("./parsers/pdf-extractor.service");
const chunker_service_1 = require("./processors/chunker.service");
let IngestionModule = class IngestionModule {
};
exports.IngestionModule = IngestionModule;
exports.IngestionModule = IngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'pdf-ingestion',
            }),
        ],
        providers: [ingestion_service_1.IngestionService, ingestion_processor_1.IngestionProcessor, pdf_extractor_service_1.PDFExtractorService, chunker_service_1.ChunkerService],
        exports: [ingestion_service_1.IngestionService],
    })
], IngestionModule);
//# sourceMappingURL=ingestion.module.js.map