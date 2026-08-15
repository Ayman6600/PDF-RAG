import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RAGService } from '../rag/rag.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RAGService,
  ) {}

  async createConversation(organizationId: string, userId: string, title?: string) {
    return this.prisma.conversation.create({
      data: {
        organizationId,
        userId,
        title: title || 'New Conversation',
      },
    });
  }

  async getConversations(organizationId: string, userId: string) {
    return this.prisma.conversation.findMany({
      where: { organizationId, userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });
  }

  async getConversationById(conversationId: string, organizationId: string) {
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
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    return conv;
  }

  async deleteConversation(conversationId: string, organizationId: string) {
    await this.getConversationById(conversationId, organizationId);
    await this.prisma.conversation.delete({ where: { id: conversationId } });
    return { message: 'Conversation deleted' };
  }

  async sendMessage(
    conversationId: string,
    organizationId: string,
    content: string,
    documentIds?: string[],
  ) {
    const conv = await this.getConversationById(conversationId, organizationId);

    // Save user message
    const userMsg = await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        role: 'user',
        content,
      },
    });

    // Update conversation title if first message
    if (conv.title === 'New Conversation') {
      const autoTitle = content.slice(0, 35) + (content.length > 35 ? '...' : '');
      await this.prisma.conversation.update({
        where: { id: conv.id },
        data: { title: autoTitle },
      });
    }

    // Generate RAG answer
    const ragResponse = await this.ragService.generateAnswer(content, organizationId, documentIds);

    // Save assistant message with citations
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

  async *streamMessage(
    conversationId: string,
    organizationId: string,
    content: string,
    documentIds?: string[],
  ) {
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

    // Save streamed assistant response to DB
    await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        role: 'assistant',
        content: fullAnswer,
      },
    });
  }
}
