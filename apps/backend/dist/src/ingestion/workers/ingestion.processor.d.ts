import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IngestionService } from '../ingestion.service';
export declare class IngestionProcessor extends WorkerHost {
    private readonly ingestionService;
    private readonly logger;
    constructor(ingestionService: IngestionService);
    process(job: Job<{
        documentId: string;
    }>): Promise<void>;
}
