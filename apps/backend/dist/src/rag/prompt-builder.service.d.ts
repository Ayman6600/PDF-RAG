import { SearchCandidate } from '../retrieval/vector-search.service';
export declare class PromptBuilderService {
    buildSystemPrompt(): string;
    buildUserMessage(query: string, chunks: SearchCandidate[]): string;
}
