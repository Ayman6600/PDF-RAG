import { OKFDocumentBundle, OKFValidationResult } from './okf.types';
export declare class OKFValidator {
    private readonly logger;
    validate(bundle: OKFDocumentBundle): OKFValidationResult;
}
