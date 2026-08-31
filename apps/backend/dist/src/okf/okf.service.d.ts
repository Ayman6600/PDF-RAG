import { ConfigService } from '@nestjs/config';
import { OKFDocumentBundle } from './okf.types';
import { OKFValidator } from './okf.validator';
export declare class OKFService {
    private readonly configService;
    private readonly validator;
    private readonly logger;
    private readonly okfBaseDir;
    constructor(configService: ConfigService, validator: OKFValidator);
    createBundleFromSections(documentId: string, documentTitle: string, extractedSections: Array<{
        title: string;
        pageStart: number;
        pageEnd: number;
        content: string;
    }>): Promise<OKFDocumentBundle>;
    private generateIndexMarkdown;
    private persistBundleToDisk;
}
