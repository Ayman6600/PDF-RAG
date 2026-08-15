-- Enable pgvector extension for embedding search
CREATE EXTENSION IF NOT EXISTS vector;
-- Enable pg_trgm for full text / fuzzy keyword matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE DATABASE okf_rag;
