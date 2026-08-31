"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OKFService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OKFService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const okf_validator_1 = require("./okf.validator");
let OKFService = OKFService_1 = class OKFService {
    constructor(configService, validator) {
        this.configService = configService;
        this.validator = validator;
        this.logger = new common_1.Logger(OKFService_1.name);
        this.okfBaseDir = this.configService.get('OKF_OUTPUT_DIR') || './knowledge/okf';
        if (!fs.existsSync(this.okfBaseDir)) {
            fs.mkdirSync(this.okfBaseDir, { recursive: true });
        }
    }
    async createBundleFromSections(documentId, documentTitle, extractedSections) {
        const sections = extractedSections.map((sec, idx) => {
            const sectionNum = (idx + 1).toString().padStart(3, '0');
            const filename = `section-${sectionNum}.md`;
            const frontmatter = {
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
        const bundle = {
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
    generateIndexMarkdown(documentId, title, sections) {
        let md = `# OKF Document Index: ${title}\n\n`;
        md += `**Document ID**: \`${documentId}\`  \n`;
        md += `**Total Sections**: ${sections.length}  \n\n`;
        md += `## Table of Contents\n\n`;
        sections.forEach((sec) => {
            md += `- [${sec.frontmatter.title}](sections/${sec.filename}) (Pages ${sec.frontmatter.page_start}-${sec.frontmatter.page_end})\n`;
        });
        return md;
    }
    async persistBundleToDisk(bundle) {
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
};
exports.OKFService = OKFService;
exports.OKFService = OKFService = OKFService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        okf_validator_1.OKFValidator])
], OKFService);
//# sourceMappingURL=okf.service.js.map