import { Injectable } from '@nestjs/common';
import { ExtractedPage, ExtractedSection } from '../parsers/pdf-extractor.service';

export interface ChunkItem {
  documentId: string;
  sectionId?: string;
  sectionTitle?: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  sourceType: 'pdf';
}

@Injectable()
export class ChunkerService {
  private readonly chunkSize: number = 500; // approx 500 words/tokens
  private readonly chunkOverlap: number = 50;

  createChunks(
    documentId: string,
    pages: ExtractedPage[],
    sections: ExtractedSection[],
    sectionIdMap: Record<string, string>,
  ): ChunkItem[] {
    const chunks: ChunkItem[] = [];
    let globalChunkIndex = 0;

    sections.forEach((sec) => {
      const dbSectionId = sectionIdMap[sec.title];
      const words = sec.content.split(/\s+/).filter((w) => w.length > 0);

      for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
        const chunkWords = words.slice(i, i + this.chunkSize);
        if (chunkWords.length === 0) continue;

        const content = chunkWords.join(' ');
        const pageNumber = this.estimatePageForChunk(sec, i, words.length, pages);

        chunks.push({
          documentId,
          sectionId: dbSectionId,
          sectionTitle: sec.title,
          pageNumber,
          chunkIndex: globalChunkIndex++,
          content,
          tokenCount: chunkWords.length,
          sourceType: 'pdf',
        });
      }
    });

    if (chunks.length === 0 && pages.length > 0) {
      pages.forEach((p, idx) => {
        chunks.push({
          documentId,
          pageNumber: p.pageNumber,
          chunkIndex: idx,
          content: p.text || 'Empty page content',
          tokenCount: p.text.split(/\s+/).length,
          sourceType: 'pdf',
        });
      });
    }

    return chunks;
  }

  private estimatePageForChunk(
    sec: ExtractedSection,
    wordIndex: number,
    totalWords: number,
    pages: ExtractedPage[],
  ): number {
    if (sec.pageStart === sec.pageEnd) {
      return sec.pageStart;
    }
    const ratio = wordIndex / Math.max(1, totalWords);
    const estimatedPage = Math.floor(sec.pageStart + ratio * (sec.pageEnd - sec.pageStart));
    return Math.min(Math.max(estimatedPage, sec.pageStart), Math.min(sec.pageEnd, pages.length || 1));
  }
}
