import { DraftsService } from './drafts.service';
import { GenerateDraftDto, RefineDraftDto } from './dto/draft.dto';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class DraftsController {
    private readonly draftsService;
    constructor(draftsService: DraftsService);
    generateDraft(dto: GenerateDraftDto, user: RequestUser): Promise<{
        markdown: string;
    }>;
    refineDraft(dto: RefineDraftDto, user: RequestUser): Promise<{
        markdown: string;
    }>;
}
