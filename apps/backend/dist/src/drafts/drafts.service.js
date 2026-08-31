"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DraftsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const llm_service_1 = require("../ai/llm.service");
let DraftsService = DraftsService_1 = class DraftsService {
    constructor(prisma, llmService) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.logger = new common_1.Logger(DraftsService_1.name);
    }
    async generateDraft(dto, organizationId) {
        this.logger.log(`Generating draft for template: "${dto.template}" (Org: ${organizationId})`);
        let context = '';
        if (dto.sectionIds && dto.sectionIds.length > 0) {
            const sections = await this.prisma.documentSection.findMany({
                where: {
                    id: { in: dto.sectionIds },
                    document: { organizationId },
                },
                orderBy: { sectionIndex: 'asc' },
            });
            context = sections.map((s) => `### Reference Section: ${s.title}\n${s.content}`).join('\n\n');
        }
        else if (dto.documentIds && dto.documentIds.length > 0) {
            const sections = await this.prisma.documentSection.findMany({
                where: {
                    documentId: { in: dto.documentIds },
                    document: { organizationId },
                },
                orderBy: [
                    { documentId: 'asc' },
                    { sectionIndex: 'asc' },
                ],
            });
            context = sections.map((s) => `### Reference Section: ${s.title}\n${s.content}`).join('\n\n');
        }
        const systemPrompt = `You are an expert corporate writer, technical analyst, and document intelligence editor.
Your objective is to generate a comprehensive, highly professional corporate draft of type: "${dto.template}".
Structure the document formally with markdown headers, lists, and tables where appropriate.
Directly ground all details, facts, and figures in the provided Reference Context.
Do not invent or hallucinate metrics, names, or specifications that are not present in the context.
Output ONLY the clean Markdown text. Do not include any greeting, intro, outro, or explanation.`;
        const userPrompt = `Draft Type: ${dto.template}
Instructions: ${dto.prompt}

Reference Context:
${context || 'No specific document context provided. Draft the document based on general corporate template conventions.'}

Begin the markdown draft:`;
        const response = await this.llmService.generateAnswer(systemPrompt, userPrompt);
        let content = response.content.trim();
        if (content.startsWith('```')) {
            content = content.replace(/^```(markdown|json)?/i, '').replace(/```$/i, '').trim();
        }
        return { markdown: content };
    }
    async refineDraft(dto, organizationId) {
        this.logger.log(`Refining draft with instructions: "${dto.refineInstruction}" (Org: ${organizationId})`);
        let context = '';
        if (dto.documentIds && dto.documentIds.length > 0) {
            const sections = await this.prisma.documentSection.findMany({
                where: {
                    documentId: { in: dto.documentIds },
                    document: { organizationId },
                },
                orderBy: [
                    { documentId: 'asc' },
                    { sectionIndex: 'asc' },
                ],
            });
            context = sections.map((s) => `### Reference Section: ${s.title}\n${s.content}`).join('\n\n');
        }
        const systemPrompt = `You are an expert corporate document editor.
Your objective is to modify and refine an existing draft according to the user's instructions.
Ensure you retain the overall formatting and tone, making changes only where requested.
Directly ground updates in the provided Reference Context. Do not introduce unverified information.
Output ONLY the revised Markdown text. Do not include any greeting, introduction, or outro.`;
        const userPrompt = `Current Draft Content:
${dto.originalDraft}

Refinement Instructions:
"${dto.refineInstruction}"

Reference Context (if applicable):
${context || 'No additional reference context provided.'}

Begin the refined markdown draft:`;
        const response = await this.llmService.generateAnswer(systemPrompt, userPrompt);
        let content = response.content.trim();
        if (content.startsWith('```')) {
            content = content.replace(/^```(markdown)?/i, '').replace(/```$/i, '').trim();
        }
        return { markdown: content };
    }
};
exports.DraftsService = DraftsService;
exports.DraftsService = DraftsService = DraftsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LLMService])
], DraftsService);
//# sourceMappingURL=drafts.service.js.map