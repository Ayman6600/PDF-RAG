import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { IngestionService } from '../ingestion.service';

@Processor('pdf-ingestion')
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(private readonly ingestionService: IngestionService) {
    super();
  }

  async process(job: Job<{ documentId: string }>): Promise<void> {
    this.logger.log(`Processing BullMQ Ingestion Job ${job.id} for document ${job.data.documentId}`);
    await this.ingestionService.processDocument(job.data.documentId);
  }
}
