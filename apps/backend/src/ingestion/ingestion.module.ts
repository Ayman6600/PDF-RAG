import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IngestionService } from './ingestion.service';
import { IngestionProcessor } from './workers/ingestion.processor';
import { PDFExtractorService } from './parsers/pdf-extractor.service';
import { ChunkerService } from './processors/chunker.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pdf-ingestion',
    }),
  ],
  providers: [IngestionService, IngestionProcessor, PDFExtractorService, ChunkerService],
  exports: [IngestionService],
})
export class IngestionModule {}
