import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PDFExtractorService } from './parsers/pdf-extractor.service';
import { OKFService } from '../okf/okf.service';
import { OKFValidator } from '../okf/okf.validator';
import { ChunkerService } from './processors/chunker.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
export declare class IngestionService {
    private readonly prisma;
    private readonly storageService;
    private readonly pdfExtractor;
    private readonly okfService;
    private readonly okfValidator;
    private readonly chunkerService;
    private readonly embeddingsService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService, pdfExtractor: PDFExtractorService, okfService: OKFService, okfValidator: OKFValidator, chunkerService: ChunkerService, embeddingsService: EmbeddingsService);
    processDocument(documentId: string): Promise<void>;
    private updateJob;
}
