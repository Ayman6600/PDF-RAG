import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';

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

@Injectable()
export class PDFExtractorService {
  private readonly logger = new Logger(PDFExtractorService.name);

  async extractPDF(pdfBuffer: Buffer): Promise<ExtractedPDFData> {
    try {
      const pageTexts: string[] = [];

      const options = {
        pagerender: (pageData: any) => {
          return pageData.getTextContent().then((textContent: any) => {
            let lastY: number | null = null;
            let text = '';
            for (const item of textContent.items) {
              if (lastY === null || Math.abs(lastY - item.transform[5]) < 5) {
                text += item.str + ' ';
              } else {
                text += '\n' + item.str + ' ';
              }
              lastY = item.transform[5];
            }
            pageTexts.push(text);
            return text;
          });
        },
      };

      const parsed = await pdfParse(pdfBuffer, options);

      const pageCount = parsed.numpages || pageTexts.length || 1;
      const pages: ExtractedPage[] = pageTexts.map((text, idx) => ({
        pageNumber: idx + 1,
        text: text.trim(),
      }));

      // If pagerender custom callback didn't capture individual pages, split parsed text
      if (pages.length === 0) {
        const rawPages = parsed.text.split(/\n\s*\n\s*Page \d+\s*\n/i);
        rawPages.forEach((pText, i) => {
          pages.push({
            pageNumber: i + 1,
            text: pText.trim(),
          });
        });
      }

      const sections = this.detectSections(pages);

      return {
        text: parsed.text,
        pageCount,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: parsed.text }],
        sections,
      };
    } catch (err: any) {
      this.logger.error(`PDF Extraction error: ${err.message}`, err.stack);
      throw new Error(`Failed to extract PDF text: ${err.message}`);
    }
  }

  private detectSections(pages: ExtractedPage[]): ExtractedSection[] {
    const sections: ExtractedSection[] = [];
    let currentSection: ExtractedSection | null = null;

    pages.forEach((page) => {
      const lines = page.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      let pageContent = '';

      lines.forEach((line) => {
        // Detect section headers (e.g. "1. Introduction", "CHAPTER 2", "Abstract", etc.)
        const isHeader =
          /^(?:[0-9]+\.|\bCHAPTER\b|\bSECTION\b|\b[A-Z0-9\s]{4,40}\b)/.test(line) &&
          line.length < 80;

        if (isHeader) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            title: line,
            pageStart: page.pageNumber,
            pageEnd: page.pageNumber,
            content: '',
          };
        } else {
          pageContent += line + ' ';
        }
      });

      if (currentSection) {
        currentSection.content += pageContent + '\n';
        currentSection.pageEnd = page.pageNumber;
      } else {
        currentSection = {
          title: 'Document Content',
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
          content: pageContent + '\n',
        };
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.length > 0
      ? sections
      : [
          {
            title: 'Overview',
            pageStart: 1,
            pageEnd: pages.length || 1,
            content: pages.map((p) => p.text).join('\n'),
          },
        ];
  }
}
