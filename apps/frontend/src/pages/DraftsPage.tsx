import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  PenTool, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Layers, 
  ArrowRight, 
  BookOpen, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  sectionIndex: number;
  pageStart: number;
  pageEnd: number;
  content: string;
}

interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  status: string;
  pageCount: number;
  createdAt: string;
}

interface DocumentDetail extends DocumentItem {
  sections: Section[];
}

export const DraftsPage: React.FC = () => {
  // Lists & Selections
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [activeDocDetail, setActiveDocDetail] = useState<DocumentDetail | null>(null);
  
  // UI states
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string>('');
  const [copiedSectionId, setCopiedSectionId] = useState<string>('');
  
  // Drafting settings
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState('Project Proposal');
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  
  // Generation & Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('');
  
  // Feedback
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all ready documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res: any = await api.get('/documents');
        const readyDocs = (res.data || []).filter((d: any) => d.status === 'READY');
        setDocuments(readyDocs);
        if (readyDocs.length > 0) {
          // Default select the first document
          setSelectedDocIds([readyDocs[0].id]);
          setActiveDocId(readyDocs[0].id);
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
        setError('Failed to load reference documents.');
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  // Fetch sections of the active document
  useEffect(() => {
    if (!activeDocId) {
      setActiveDocDetail(null);
      return;
    }

    const fetchSections = async () => {
      setIsLoadingSections(true);
      try {
        const res: any = await api.get(`/documents/${activeDocId}`);
        setActiveDocDetail(res.data);
        if (res.data?.sections?.length > 0) {
          setExpandedSectionId(res.data.sections[0].id);
        } else {
          setExpandedSectionId('');
        }
      } catch (err) {
        console.error('Failed to load document outline:', err);
        setError('Failed to load document sections outline.');
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
  }, [activeDocId]);

  // Toggle document selection
  const handleDocToggle = (docId: string) => {
    setSelectedDocIds(prev => {
      if (prev.includes(docId)) {
        const next = prev.filter(id => id !== docId);
        // If the toggled doc was the active explorer doc, choose another one or empty
        if (activeDocId === docId) {
          setActiveDocId(next[0] || '');
        }
        return next;
      } else {
        const next = [...prev, docId];
        // Set as active explorer if first active is empty
        if (!activeDocId) {
          setActiveDocId(docId);
        }
        return next;
      }
    });
  };

  // Toggle section checkbox for focused drafting
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSectionIds(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  // Copy section text to clipboard
  const handleCopySection = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSectionId(sectionId);
      setTimeout(() => setCopiedSectionId(''), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Append section content to drafting prompt as a blockquote
  const handleInsertQuote = (title: string, content: string) => {
    const quote = `\n\n> [Quote from "${title}"]: "${content.slice(0, 400)}${content.length > 400 ? '...' : ''}"\n\n`;
    setPrompt(prev => prev + quote);
  };

  // Handle document generation
  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocIds.length === 0) {
      setError('Please select at least one reference document.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter drafting instructions.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const res: any = await api.post('/drafts/generate', {
        documentIds: selectedDocIds,
        prompt,
        template,
        sectionIds: selectedSectionIds,
      });
      setGeneratedMarkdown(res.data.markdown);
    } catch (err: any) {
      setError(err.error?.message || 'Failed to generate draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle draft refinement
  const handleRefineDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedMarkdown) return;
    if (!refineInstruction.trim()) return;

    setIsRefining(true);
    setError(null);
    try {
      const res: any = await api.post('/drafts/refine', {
        originalDraft: generatedMarkdown,
        refineInstruction,
        documentIds: selectedDocIds,
      });
      setGeneratedMarkdown(res.data.markdown);
      setRefineInstruction('');
    } catch (err: any) {
      setError(err.error?.message || 'Failed to refine draft.');
    } finally {
      setIsRefining(false);
    }
  };

  // Export actions
  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadDraft = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    const fileName = `${template.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-draft.md`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex flex-col space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 select-none">
        <div>
          <h2 className="text-2xl font-bold text-ink tracking-apple-headline">Office Draft Workspace</h2>
          <p className="text-xs text-muted-ink mt-0.5 tracking-apple-tight">
            Create, refine, and export corporate document drafts grounded in your RAG-PDF library context.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-error-red/5 border border-error-red/25 text-error-red text-xs rounded-xl flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Dual Pane Content */}
      <div className="flex-1 flex min-h-0 gap-5">
        
        {/* LEFT PANE - Reference selector & Outlines (40%) */}
        <div className="w-[40%] flex flex-col min-h-0 bg-canvas rounded-2xl border border-hairline shadow-sm overflow-hidden">
          {/* Header section with reference dropdown */}
          <div className="p-4 bg-canvas-parchment/60 border-b border-hairline space-y-3 shrink-0">
            <div className="flex items-center justify-between select-none">
              <span className="text-[11px] font-bold uppercase text-muted-ink tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Reference PDFs
              </span>
              <span className="text-[10px] text-primary font-bold">
                {selectedDocIds.length} Selected
              </span>
            </div>

            {/* Reference Multi-Select Checkbox Box */}
            <div className="max-h-28 overflow-y-auto bg-canvas border border-hairline rounded-xl p-2.5 space-y-1.5">
              {isLoadingDocs ? (
                <div className="flex items-center justify-center p-4 text-[10px] text-muted-ink">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-primary" /> Loading PDFs...
                </div>
              ) : documents.length === 0 ? (
                <div className="text-[10px] text-muted-soft text-center p-4 font-mono">
                  No indexed PDFs ready. Ingest a PDF in the library first.
                </div>
              ) : (
                documents.map(doc => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <label 
                      key={doc.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                        isChecked ? 'bg-primary/5 border border-primary/20' : 'hover:bg-canvas-parchment border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDocToggle(doc.id)}
                          className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-hairline cursor-pointer"
                        />
                        <span className="font-semibold text-ink truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <span className="text-[9px] text-muted-ink font-mono shrink-0">
                        {doc.pageCount || 1} pgs
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Outline section */}
          <div className="flex-1 flex flex-col min-h-0 bg-canvas">
            {/* Outline navigation tabs (if multiple selected, let the user choose which one to view sections for) */}
            {selectedDocIds.length > 1 && (
              <div className="px-4 py-2 border-b border-hairline bg-canvas flex gap-1.5 overflow-x-auto shrink-0 select-none scrollbar-none">
                {selectedDocIds.map(docId => {
                  const docObj = documents.find(d => d.id === docId);
                  if (!docObj) return null;
                  const isActive = activeDocId === docId;
                  return (
                    <button
                      key={docId}
                      onClick={() => setActiveDocId(docId)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                        isActive 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'border-hairline text-muted-ink hover:text-ink hover:bg-canvas-parchment'
                      }`}
                    >
                      {docObj.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sections display */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 select-none">
                <span className="text-[10px] font-bold uppercase text-muted-ink tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> Table of Contents (OKF Outline)
                </span>
              </div>

              {isLoadingSections ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-ink select-none">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mb-1.5" />
                  <p className="text-[10px] font-mono">Parsing outline sections...</p>
                </div>
              ) : !activeDocDetail || activeDocDetail.sections.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-hairline rounded-xl select-none">
                  <BookOpen className="w-8 h-8 text-muted-soft mx-auto mb-2" />
                  <p className="text-xs font-semibold text-ink">No outline sections loaded</p>
                  <p className="text-[10px] text-muted-ink mt-1">Select a reference PDF to explore its document outline.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDocDetail.sections.map((sec, idx) => {
                    const isExpanded = expandedSectionId === sec.id;
                    const isChecked = selectedSectionIds.includes(sec.id);
                    return (
                      <div 
                        key={sec.id}
                        className={`border rounded-xl transition-all ${
                          isExpanded ? 'border-primary/40 bg-primary/5/10 shadow-sm' : 'border-hairline bg-canvas hover:bg-canvas-parchment/30'
                        }`}
                      >
                        {/* Section Card Header */}
                        <div 
                          onClick={() => setExpandedSectionId(isExpanded ? '' : sec.id)}
                          className="p-3 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSectionToggle(sec.id)}
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-hairline cursor-pointer"
                              title="Scope drafting to this section"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-ink truncate pr-2">
                                {(idx + 1).toString().padStart(2, '0')}. {sec.title}
                              </h4>
                              <p className="text-[9px] text-muted-ink font-mono mt-0.5">
                                Pages {sec.pageStart} - {sec.pageEnd}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center text-muted-ink">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Section Card Body (Expanded Content) */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-hairline pt-3 bg-canvas/50 rounded-b-xl space-y-3">
                            <div className="bg-canvas-parchment p-3 rounded-lg border border-hairline/80 max-h-40 overflow-y-auto text-[11px] leading-relaxed text-ink font-sans whitespace-pre-wrap select-text selection:bg-primary/20">
                              {sec.content}
                            </div>
                            
                            {/* Action Row */}
                            <div className="flex items-center gap-2 justify-end select-none">
                              <button
                                onClick={() => handleCopySection(sec.id, sec.content)}
                                className="px-2.5 py-1.5 hover:bg-canvas border border-hairline text-muted-ink hover:text-ink rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                              >
                                {copiedSectionId === sec.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Text</span>
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleInsertQuote(sec.title, sec.content)}
                                className="px-2.5 py-1.5 bg-primary hover:bg-primary-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                title="Insert section as markdown quote into drafting prompt"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Insert Quote</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE - AI Draft Editor (60%) */}
        <div className="flex-1 flex flex-col min-h-0 bg-canvas rounded-2xl border border-hairline shadow-sm overflow-hidden">
          
          {/* Main workspace editor scroll region */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Top inputs: prompt instruction & template selector */}
            <form onSubmit={handleGenerateDraft} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase text-muted-ink mb-1.5 select-none pl-1">
                    Corporate Template Style
                  </label>
                  <select 
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full bg-canvas border border-hairline rounded-xl px-4 h-10 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Executive Memo">Executive Memo</option>
                    <option value="Specification Sheet">Specification Sheet</option>
                    <option value="Project Proposal">Project Proposal</option>
                    <option value="Standard Contract">Standard Contract</option>
                    <option value="Meeting Brief">Meeting Brief</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase text-muted-ink mb-1.5 select-none pl-1">
                    Draft Scope
                  </label>
                  <div className="w-full bg-canvas-parchment/60 border border-hairline rounded-xl px-4 h-10 text-xs font-bold text-primary flex items-center justify-between select-none">
                    <span>
                      {selectedSectionIds.length > 0 
                        ? `${selectedSectionIds.length} Checked Sections` 
                        : "All Sections of Selected PDF(s)"}
                    </span>
                    {selectedSectionIds.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedSectionIds([])}
                        className="text-[9px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-md transition-colors"
                      >
                        Reset Checkbox
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-ink mb-1.5 select-none pl-1">
                  Drafting Instructions & Prompt
                </label>
                <textarea
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Define draft scope (e.g. 'Draft an executive report summarizing the target metrics in section 2, focusing on timeline details.')"
                  className="w-full h-24 p-4 bg-canvas border border-hairline rounded-2xl text-xs text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end select-none">
                <button
                  type="submit"
                  disabled={isGenerating || selectedDocIds.length === 0}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-600 disabled:bg-primary/45 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:cursor-not-allowed shadow-md shadow-primary/15"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting Knowledge...</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Generate Document Draft</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Generated Output panel */}
            <div className="border-t border-hairline pt-5 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-2.5 select-none">
                <span className="text-[11px] font-bold uppercase text-muted-ink tracking-wider">
                  Draft Output Panel
                </span>
                
                {generatedMarkdown && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyDraft}
                      className="px-2.5 py-1.5 hover:bg-canvas-parchment border border-hairline text-muted-ink hover:text-ink rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedDraft ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleDownloadDraft}
                      className="px-2.5 py-1.5 hover:bg-canvas-parchment border border-hairline text-muted-ink hover:text-ink rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea containing generated Markdown */}
              {generatedMarkdown ? (
                <div className="flex-1 flex flex-col space-y-4">
                  <textarea
                    value={generatedMarkdown}
                    onChange={(e) => setGeneratedMarkdown(e.target.value)}
                    className="flex-1 w-full min-h-[300px] p-4 bg-canvas-parchment/40 text-ink border border-hairline rounded-2xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />

                  {/* Refinement instruction input box */}
                  <form onSubmit={handleRefineDraft} className="border-t border-hairline pt-4 space-y-2 select-none">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="Refine draft (e.g. 'Add a section on project risks', 'Reformat key items in a table')"
                        className="flex-1 bg-canvas border border-hairline rounded-full px-5 h-10 text-xs text-ink placeholder:text-muted-soft focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isRefining}
                        className="h-10 px-5 bg-primary hover:bg-primary-600 disabled:bg-primary/45 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        {isRefining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Refine</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-hairline rounded-2xl bg-canvas-parchment/30 select-none">
                  <FileText className="w-10 h-10 text-muted-soft mb-2.5 opacity-40" />
                  <h4 className="text-xs font-bold text-ink">No Draft Composed Yet</h4>
                  <p className="text-[10px] text-muted-ink max-w-sm mt-1 leading-relaxed">
                    Choose one or more reference documents in the left panel, pick a template style, input your drafting prompts, and hit generate.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
