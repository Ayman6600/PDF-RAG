export enum DocumentStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  INDEXING = 'INDEXING',
  READY = 'READY',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface DocumentDto {
  id: string;
  organizationId: string;
  name: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  status: DocumentStatus;
  pageCount: number;
  checksum: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSectionDto {
  id: string;
  documentId: string;
  title: string;
  sectionIndex: number;
  pageStart: number;
  pageEnd: number;
  content: string;
}

export interface DocumentChunkDto {
  id: string;
  documentId: string;
  sectionId?: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  tokenCount: number;
  sourceType: 'pdf';
}

export interface CitationDto {
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkId: string;
  snippet: string;
  relevanceScore: number;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationDto[];
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: MessageDto[];
}

export interface OKFFrontmatter {
  type: string;
  title: string;
  document_id: string;
  page_start: number;
  page_end: number;
  source_type: 'pdf';
  tags?: string[];
}

export interface OKFSectionBundle {
  sectionId: string;
  frontmatter: OKFFrontmatter;
  content: string;
}

export interface OKFKnowledgeBundle {
  documentId: string;
  indexMarkdown: string;
  metadataYaml: string;
  sections: OKFSectionBundle[];
}

export interface OKFValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SSEEvent {
  event: 'message_start' | 'retrieval_start' | 'retrieval_result' | 'generation_start' | 'token' | 'citation' | 'message_complete' | 'error';
  data: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export interface RetrievalQueryDto {
  query: string;
  conversationId?: string;
  documentIds?: string[];
  topK?: number;
  useReranker?: boolean;
}

export interface GroundedAnswerResult {
  answer: string;
  citations: CitationDto[];
  confidenceScore: number;
  retrievedChunksCount: number;
}
