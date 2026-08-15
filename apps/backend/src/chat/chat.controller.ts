import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat conversation' })
  async createConversation(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.organizationId, user.userId, dto.title);
  }

  @Get()
  @ApiOperation({ summary: 'List user conversations' })
  async getConversations(@CurrentUser() user: RequestUser) {
    return this.chatService.getConversations(user.organizationId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details and messages' })
  async getConversationById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.getConversationById(id, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  async deleteConversation(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.deleteConversation(id, user.organizationId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send message to conversation (Synchronous RAG)' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, user.organizationId, dto.content, dto.documentIds);
  }

  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream chat response via Server-Sent Events (SSE)' })
  async streamMessage(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Query('content') content: string,
    @Query('documentIds') documentIdsQuery: string,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const documentIds = documentIdsQuery ? documentIdsQuery.split(',') : undefined;

    res.write(`event: message_start\ndata: ${JSON.stringify({ conversationId: id })}\n\n`);

    try {
      for await (const event of this.chatService.streamMessage(id, user.organizationId, content, documentIds)) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
      }
      res.write(`event: message_complete\ndata: ${JSON.stringify({ status: 'done' })}\n\n`);
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
    } finally {
      res.end();
    }
  }
}
