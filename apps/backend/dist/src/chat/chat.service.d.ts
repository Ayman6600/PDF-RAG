import { PrismaService } from '../database/prisma.service';
import { RAGService } from '../rag/rag.service';
export declare class ChatService {
    private readonly prisma;
    private readonly ragService;
    private readonly logger;
    constructor(prisma: PrismaService, ragService: RAGService);
    createConversation(organizationId: string, userId: string, title?: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    getConversations(organizationId: string, userId: string): Promise<({
        _count: {
            messages: number;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    })[]>;
    getConversationById(conversationId: string, organizationId: string): Promise<{
        messages: ({
            citations: {
                id: string;
                documentId: string;
                pageNumber: number;
                documentName: string;
                relevanceScore: number;
                snippet: string;
                chunkId: string;
                messageId: string;
            }[];
        } & {
            id: string;
            role: string;
            createdAt: Date;
            content: string;
            conversationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    deleteConversation(conversationId: string, organizationId: string): Promise<{
        message: string;
    }>;
    sendMessage(conversationId: string, organizationId: string, content: string, documentIds?: string[]): Promise<{
        userMessage: {
            id: string;
            role: string;
            createdAt: Date;
            content: string;
            conversationId: string;
        };
        assistantMessage: {
            citations: {
                id: string;
                documentId: string;
                pageNumber: number;
                documentName: string;
                relevanceScore: number;
                snippet: string;
                chunkId: string;
                messageId: string;
            }[];
        } & {
            id: string;
            role: string;
            createdAt: Date;
            content: string;
            conversationId: string;
        };
    }>;
    streamMessage(conversationId: string, organizationId: string, content: string, documentIds?: string[]): AsyncGenerator<{
        type: "retrieval" | "token" | "citation" | "complete";
        data: any;
    }, void, unknown>;
}
