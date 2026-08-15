import { Injectable, Logger } from '@nestjs/common';
import { OKFDocumentBundle, OKFValidationResult } from './okf.types';

@Injectable()
export class OKFValidator {
  private readonly logger = new Logger(OKFValidator.name);

  validate(bundle: OKFDocumentBundle): OKFValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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
}
