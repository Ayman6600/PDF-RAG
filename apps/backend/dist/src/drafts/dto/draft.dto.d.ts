export declare class GenerateDraftDto {
    documentIds: string[];
    prompt: string;
    template: string;
    sectionIds?: string[];
}
export declare class RefineDraftDto {
    originalDraft: string;
    refineInstruction: string;
    documentIds?: string[];
}
