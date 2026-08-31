import { PrismaService } from '../database/prisma.service';
import { LLMService } from '../ai/llm.service';
import { GenerateDraftDto, RefineDraftDto } from './dto/draft.dto';
export declare class DraftsService {
    private readonly prisma;
    private readonly llmService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LLMService);
    generateDraft(dto: GenerateDraftDto, organizationId: string): Promise<{
        markdown: string;
    }>;
    refineDraft(dto: RefineDraftDto, organizationId: string): Promise<{
        markdown: string;
    }>;
}
