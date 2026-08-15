import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [
    IngestionModule,
    BullModule.registerQueue({
      name: 'pdf-ingestion',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
