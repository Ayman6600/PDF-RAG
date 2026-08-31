"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OKFValidator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OKFValidator = void 0;
const common_1 = require("@nestjs/common");
let OKFValidator = OKFValidator_1 = class OKFValidator {
    constructor() {
        this.logger = new common_1.Logger(OKFValidator_1.name);
    }
    validate(bundle) {
        const errors = [];
        const warnings = [];
        if (!bundle.documentId) {
            errors.push('Missing documentId in OKF bundle');
        }
        if (!bundle.indexMarkdown || bundle.indexMarkdown.trim() === '') {
            errors.push('Empty index.md in OKF bundle');
        }
        if (!bundle.sections || bundle.sections.length === 0) {
            errors.push('OKF bundle contains zero sections');
        }
        bundle.sections.forEach((sec, idx) => {
            if (!sec.frontmatter) {
                errors.push(`Section ${idx + 1} is missing YAML frontmatter`);
                return;
            }
            if (sec.frontmatter.type !== 'DocumentSection') {
                errors.push(`Section ${idx + 1} invalid type '${sec.frontmatter.type}', expected 'DocumentSection'`);
            }
            if (!sec.frontmatter.title || sec.frontmatter.title.trim() === '') {
                errors.push(`Section ${idx + 1} has empty title`);
            }
            if (sec.frontmatter.page_start <= 0 || sec.frontmatter.page_end < sec.frontmatter.page_start) {
                errors.push(`Section ${idx + 1} has invalid page range: ${sec.frontmatter.page_start}-${sec.frontmatter.page_end}`);
            }
            if (!sec.content || sec.content.trim() === '') {
                warnings.push(`Section ${idx + 1} (${sec.filename}) has empty body content`);
            }
        });
        const isValid = errors.length === 0;
        this.logger.log(`OKF Validation for Document ${bundle.documentId}: ${isValid ? 'PASSED' : 'FAILED'}`);
        return {
            valid: isValid,
            errors,
            warnings,
        };
    }
};
exports.OKFValidator = OKFValidator;
exports.OKFValidator = OKFValidator = OKFValidator_1 = __decorate([
    (0, common_1.Injectable)()
], OKFValidator);
//# sourceMappingURL=okf.validator.js.map