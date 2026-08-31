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
export declare class ChunkerService {
    private readonly chunkSize;
    private readonly chunkOverlap;
    createChunks(documentId: string, pages: ExtractedPage[], sections: ExtractedSection[], sectionIdMap: Record<string, string>): ChunkItem[];
    private estimatePageForChunk;
}
