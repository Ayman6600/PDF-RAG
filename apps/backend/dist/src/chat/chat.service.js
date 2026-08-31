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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const rag_service_1 = require("../rag/rag.service");
let ChatService = ChatService_1 = class ChatService {
    constructor(prisma, ragService) {
        this.prisma = prisma;
        this.ragService = ragService;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async createConversation(organizationId, userId, title) {
        return this.prisma.conversation.create({
            data: {
                organizationId,
                userId,
                title: title || 'New Conversation',
            },
        });
    }
    async getConversations(organizationId, userId) {
        return this.prisma.conversation.findMany({
            where: { organizationId, userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { messages: true } },
            },
        });
    }
    async getConversationById(conversationId, organizationId) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, organizationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { citations: true },
                },
            },
        });
        if (!conv) {
            throw new common_1.NotFoundException(`Conversation ${conversationId} not found`);
        }
        return conv;
    }
    async deleteConversation(conversationId, organizationId) {
        await this.getConversationById(conversationId, organizationId);
        await this.prisma.conversation.delete({ where: { id: conversationId } });
        return { message: 'Conversation deleted' };
    }
    async sendMessage(conversationId, organizationId, content, documentIds) {
        const conv = await this.getConversationById(conversationId, organizationId);
        const userMsg = await this.prisma.message.create({
            data: {
                conversationId: conv.id,
                role: 'user',
                content,
            },
        });
        if (conv.title === 'New Conversation') {
            const autoTitle = content.slice(0, 35) + (content.length > 35 ? '...' : '');
            await this.prisma.conversation.update({
                where: { id: conv.id },
                data: { title: autoTitle },
            });
        }
        const ragResponse = await this.ragService.generateAnswer(content, organizationId, documentIds);
        const assistantMsg = await this.prisma.message.create({
            data: {
                conversationId: conv.id,
                role: 'assistant',
                content: ragResponse.answer,
                citations: {
                    create: ragResponse.citations.map((c) => ({
                        chunkId: c.chunkId,
                        documentId: c.documentId,
                        documentName: c.documentName,
                        pageNumber: c.pageNumber,
                        relevanceScore: c.relevanceScore,
                        snippet: c.snippet,
                    })),
                },
            },
            include: { citations: true },
        });
        return {
            userMessage: userMsg,
            assistantMessage: assistantMsg,
        };
    }
    async *streamMessage(conversationId, organizationId, content, documentIds) {
        const conv = await this.getConversationById(conversationId, organizationId);
        await this.prisma.message.create({
            data: {
                conversationId: conv.id,
                role: 'user',
                content,
            },
        });
        let fullAnswer = '';
        for await (const event of this.ragService.streamAnswer(content, organizationId, documentIds)) {
            if (event.type === 'token') {
                fullAnswer += event.data.text;
            }
            yield event;
        }
        await this.prisma.message.create({
            data: {
                conversationId: conv.id,
                role: 'assistant',
                content: fullAnswer,
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rag_service_1.RAGService])
], ChatService);
//# sourceMappingURL=chat.service.js.map