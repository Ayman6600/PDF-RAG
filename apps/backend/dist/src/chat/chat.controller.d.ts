import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(user: RequestUser, dto: CreateConversationDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
    getConversations(user: RequestUser): Promise<({
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
    getConversationById(id: string, user: RequestUser): Promise<{
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
    deleteConversation(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    sendMessage(id: string, user: RequestUser, dto: SendMessageDto): Promise<{
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
    streamMessage(id: string, user: RequestUser, content: string, documentIdsQuery: string, res: Response): Promise<void>;
}
