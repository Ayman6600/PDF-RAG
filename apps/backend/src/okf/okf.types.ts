export interface OKFFrontmatter {
  type: 'DocumentSection';
  title: string;
  document_id: string;
  page_start: number;
  page_end: number;
  source_type: 'pdf';
  tags: string[];
}

export interface OKFSectionFile {
  filename: string;
  frontmatter: OKFFrontmatter;
  content: string;
}

export interface OKFDocumentBundle {
  documentId: string;
  indexMarkdown: string;
  metadataYaml: string;
  sections: OKFSectionFile[];
}

export interface OKFValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
