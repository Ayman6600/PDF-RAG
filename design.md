# RAG-PDF: Office Draft & Document Intelligence Workspace Design

This document defines the user interface, naming, and functionality updates to transform OKF-RAG into **RAG-PDF**, a production-grade RAG and document intelligence platform optimized for corporate office workflows (drafting reports, memos, specifications, and proposals).

---

## 1. Naming & Branding Updates (RAG-PDF)
- **App Name**: Renamed from `OKF RAG` / `OKF-RAG` to **RAG-PDF**.
- **Branding Elements**: 
  - Update Sidebar title and sub-tagline.
  - Update browser title tags.
  - Update initial load page spinner text and header components.
- **Visual Palette**: Transition from purely developer-oriented neon highlights to a clean, professional **Office Corporate Slate & Indigo** theme with premium card layouts.

---

## 2. Outstanding Feature: "Office Draft Workspace"
A dedicated workspace for creating, editing, and exporting formal drafts using the grounded PDF knowledge base.

### Layout: Dual-Pane Screen
- **Left Pane (Reference Selector & Outlines)**:
  - Dropdown to select one or multiple indexed PDFs.
  - Interactive table of contents / OKF sections index for the selected PDF.
  - Content snippets from sections can be quickly copied as quotes into the editor.
- **Right Pane (AI Draft Editor)**:
  - **Drafting Prompt Area**: Text input to define what draft to generate (e.g. *"Create a project spec report draft based on Section 2 and 3"*).
  - **Corporate Template Selector**: Dropdown to select a template (e.g. *Executive Memo, Specification Sheet, Project Proposal, Standard Contract*).
  - **Draft Output Panel**: An editable textarea displaying the generated markdown.
  - **Export Tooling**:
    - **Copy to Clipboard** button.
    - **Download Draft (.md)** button.
    - **Regenerate / Refine** button.

---

## 3. UI Flow & Routes
- **Route `/drafts`**: A new navbar path `NavLink` in the sidebar to access the **Office Draft Workspace**.
- **Route `/` & `/chat`**: Renamed from "Document Workspace" to "Grounded Q&A Chat".
- **Route `/documents`**: Renamed from "Document Library" to "PDF Library".
- **Route `/dashboard`**: Renamed from "Dashboard Metrics" to "Library Analytics".
