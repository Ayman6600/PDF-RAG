import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DraftsService } from './drafts.service';
import { GenerateDraftDto, RefineDraftDto } from './dto/draft.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Drafts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new markdown draft from a template and reference documents' })
  async generateDraft(
    @Body() dto: GenerateDraftDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.draftsService.generateDraft(dto, user.organizationId);
  }

  @Post('refine')
  @ApiOperation({ summary: 'Refine/edit an existing draft using user prompt instructions' })
  async refineDraft(
    @Body() dto: RefineDraftDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.draftsService.refineDraft(dto, user.organizationId);
  }
}
