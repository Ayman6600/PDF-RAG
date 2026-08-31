import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a PDF document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB Max PDF
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.uploadDocument(file, user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'List organization documents' })
  async getDocuments(
    @CurrentUser() user: RequestUser,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.documentsService.getDocuments(user.organizationId, search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details by ID' })
  async getDocumentById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.getDocumentById(id, user.organizationId);
  }

  @Get(':id/chunks')
  @ApiOperation({ summary: 'Get extracted chunks for a document' })
  async getDocumentChunks(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.getDocumentChunks(id, user.organizationId);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download/View original PDF file' })
  async getDocumentFile(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Res() res: Response,
  ) {
    const buffer = await this.documentsService.getDocumentFileBuffer(id, user.organizationId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.send(buffer);
  }

  @Post(':id/reprocess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger re-ingestion of a document' })
  async reprocessDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.reprocessDocument(id, user.organizationId);
  }

  @Get(':id/sections/:sectionId/insights')
  @ApiOperation({ summary: 'Get AI-generated summary and suggested questions for a section' })
  async getSectionInsights(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.getSectionInsights(id, sectionId, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.deleteDocument(id, user.organizationId);
  }
}
