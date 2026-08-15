import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { OKFDocumentBundle, OKFFrontmatter, OKFSectionFile } from './okf.types';
import { OKFValidator } from './okf.validator';

@Injectable()
export class OKFService {
  private readonly logger = new Logger(OKFService.name);
  private readonly okfBaseDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly validator: OKFValidator,
  ) {
    this.okfBaseDir = this.configService.get<string>('OKF_OUTPUT_DIR') || './knowledge/okf';
    if (!fs.existsSync(this.okfBaseDir)) {
      fs.mkdirSync(this.okfBaseDir, { recursive: true });
    }
  }

  async createBundleFromSections(
    documentId: string,
    documentTitle: string,
    extractedSections: Array<{ title: string; pageStart: number; pageEnd: number; content: string }>,
  ): Promise<OKFDocumentBundle> {
    const sections: OKFSectionFile[] = extractedSections.map((sec, idx) => {
      const sectionNum = (idx + 1).toString().padStart(3, '0');
      const filename = `section-${sectionNum}.md`;
      const frontmatter: OKFFrontmatter = {
        type: 'DocumentSection',
        title: sec.title || `Section ${idx + 1}`,
        document_id: documentId,
        page_start: sec.pageStart,
        page_end: sec.pageEnd,
        source_type: 'pdf',
        tags: [sec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')],
      };

      return {
        filename,
        frontmatter,
        content: sec.content,
      };
    });

    const indexMarkdown = this.generateIndexMarkdown(documentId, documentTitle, sections);
    const metadataYaml = yaml.dump({
      document_id: documentId,
      title: documentTitle,
      total_sections: sections.length,
      created_at: new Date().toISOString(),
    });

    const bundle: OKFDocumentBundle = {
      documentId,
      indexMarkdown,
      metadataYaml,
      sections,
    };

    const validationResult = this.validator.validate(bundle);
    if (!validationResult.valid) {
      throw new Error(`OKF Validation failed: ${validationResult.errors.join('; ')}`);
    }

    await this.persistBundleToDisk(bundle);
    return bundle;
  }

  private generateIndexMarkdown(documentId: string, title: string, sections: OKFSectionFile[]): string {
    let md = `# OKF Document Index: ${title}\n\n`;
    md += `**Document ID**: \`${documentId}\`  \n`;
    md += `**Total Sections**: ${sections.length}  \n\n`;
    md += `## Table of Contents\n\n`;

    sections.forEach((sec) => {
      md += `- [${sec.frontmatter.title}](sections/${sec.filename}) (Pages ${sec.frontmatter.page_start}-${sec.frontmatter.page_end})\n`;
    });

    return md;
  }

  private async persistBundleToDisk(bundle: OKFDocumentBundle): Promise<void> {
    const docDir = path.join(this.okfBaseDir, 'documents', bundle.documentId);
    const sectionsDir = path.join(docDir, 'sections');

    await fs.promises.mkdir(sectionsDir, { recursive: true });

    await fs.promises.writeFile(path.join(docDir, 'index.md'), bundle.indexMarkdown);
    await fs.promises.writeFile(path.join(docDir, 'metadata.md'), bundle.metadataYaml);

    for (const sec of bundle.sections) {
      const frontmatterYaml = yaml.dump(sec.frontmatter);
      const fullContent = `---\n${frontmatterYaml}---\n\n${sec.content}`;
      await fs.promises.writeFile(path.join(sectionsDir, sec.filename), fullContent);
    }

    this.logger.log(`Persisted OKF bundle for document ${bundle.documentId} at ${docDir}`);
  }
}
