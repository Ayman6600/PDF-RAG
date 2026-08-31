export interface ExtractedPage {
    pageNumber: number;
    text: string;
}
export interface ExtractedSection {
    title: string;
    pageStart: number;
    pageEnd: number;
    content: string;
}
export interface ExtractedPDFData {
    text: string;
    pageCount: number;
    pages: ExtractedPage[];
    sections: ExtractedSection[];
}
export declare class PDFExtractorService {
    private readonly logger;
    extractPDF(pdfBuffer: Buffer): Promise<ExtractedPDFData>;
    private detectSections;
}
