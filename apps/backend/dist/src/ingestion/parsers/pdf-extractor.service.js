"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PDFExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFExtractorService = void 0;
const common_1 = require("@nestjs/common");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
let PDFExtractorService = PDFExtractorService_1 = class PDFExtractorService {
    constructor() {
        this.logger = new common_1.Logger(PDFExtractorService_1.name);
    }
    async extractPDF(pdfBuffer) {
        try {
            const pageTexts = [];
            const options = {
                pagerender: (pageData) => {
                    return pageData.getTextContent().then((textContent) => {
                        let lastY = null;
                        let text = '';
                        for (const item of textContent.items) {
                            if (lastY === null || Math.abs(lastY - item.transform[5]) < 5) {
                                text += item.str + ' ';
                            }
                            else {
                                text += '\n' + item.str + ' ';
                            }
                            lastY = item.transform[5];
                        }
                        pageTexts.push(text);
                        return text;
                    });
                },
            };
            const parsed = await (0, pdf_parse_1.default)(pdfBuffer, options);
            const pageCount = parsed.numpages || pageTexts.length || 1;
            const pages = pageTexts.map((text, idx) => ({
                pageNumber: idx + 1,
                text: text.trim(),
            }));
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
        }
        catch (err) {
            this.logger.error(`PDF Extraction error: ${err.message}`, err.stack);
            throw new Error(`Failed to extract PDF text: ${err.message}`);
        }
    }
    detectSections(pages) {
        const sections = [];
        let currentSection = null;
        pages.forEach((page) => {
            const lines = page.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
            let pageContent = '';
            lines.forEach((line) => {
                const isHeader = /^(?:[0-9]+\.|\bCHAPTER\b|\bSECTION\b|\b[A-Z0-9\s]{4,40}\b)/.test(line) &&
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
                }
                else {
                    pageContent += line + ' ';
                }
            });
            if (currentSection) {
                currentSection.content += pageContent + '\n';
                currentSection.pageEnd = page.pageNumber;
            }
            else {
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
};
exports.PDFExtractorService = PDFExtractorService;
exports.PDFExtractorService = PDFExtractorService = PDFExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], PDFExtractorService);
//# sourceMappingURL=pdf-extractor.service.js.map