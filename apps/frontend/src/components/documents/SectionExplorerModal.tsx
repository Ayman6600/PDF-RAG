import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Lightbulb, ArrowRight, ChevronRight, Loader2, BookOpen, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Section {
  id: string;
  title: string;
  sectionIndex: number;
  pageStart: number;
  pageEnd: number;
  content: string;
}

interface DocumentDetail {
  id: string;
  name: string;
  sections: Section[];
}

interface SectionInsights {
  summary: string;
  questions: string[];
}

interface SectionExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
}

export const SectionExplorerModal: React.FC<SectionExplorerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
}) => {
  const navigate = useNavigate();
  const [docDetail, setDocDetail] = useState<DocumentDetail | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<Record<string, SectionInsights>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const res: any = await api.get(`/documents/${documentId}`);
        setDocDetail(res.data);
        if (res.data?.sections?.length > 0) {
          setSelectedSection(res.data.sections[0]);
        }
      } catch (err) {
        console.error('Failed to load document sections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, documentId]);

  const generateInsights = async (sectionId: string) => {
    if (insights[sectionId] || loadingInsights[sectionId]) return;

    setLoadingInsights((prev) => ({ ...prev, [sectionId]: true }));
    try {
      const res: any = await api.get(`/documents/${documentId}/sections/${sectionId}/insights`);
      setInsights((prev) => ({ ...prev, [sectionId]: res.data }));
    } catch (err) {
      console.error('Failed to generate insights:', err);
      alert('Failed to generate AI insights for this section.');
    } finally {
      setLoadingInsights((prev) => ({ ...prev, [sectionId]: false }));
    }
  };

  if (!isOpen) return null;

  const activeInsights = selectedSection ? insights[selectedSection.id] : null;
  const isInsightsLoading = selectedSection ? loadingInsights[selectedSection.id] : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[85vh] bg-canvas rounded-[18px] border border-hairline flex flex-col overflow-hidden shadow-sm animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-canvas border-b border-hairline select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-base truncate max-w-lg tracking-apple-headline">
                OKF Section Explorer: {documentName}
              </h3>
              <p className="text-xs text-muted-ink mt-0.5 tracking-apple-tight">Navigate document sections and explore suggested AI questions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-canvas-parchment rounded-full text-muted-ink hover:text-ink transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-ink select-none">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs font-mono">Parsing OKF section graph...</p>
          </div>
        ) : !docDetail || docDetail.sections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-ink p-8 select-none">
            <BookOpen className="w-12 h-12 mb-3 text-muted-ink" />
            <p className="text-sm font-semibold text-ink">No section outline detected</p>
            <p className="text-xs text-muted-ink mt-1 max-w-sm text-center">
              This document has not been partitioned into sections yet. Try re-processing the document.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel - Vertically Connected Outline */}
            <div className="w-1/3 border-r border-hairline overflow-y-auto p-4 bg-canvas-parchment relative">
              <div className="absolute top-8 left-9 bottom-8 w-[2px] bg-hairline" />
              
              <div className="space-y-4">
                {docDetail.sections.map((sec, idx) => {
                  const isSelected = selectedSection?.id === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSection(sec)}
                      className={`relative flex gap-4 p-3 rounded-[12px] cursor-pointer transition-all border active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-canvas border-hairline hover:bg-canvas-parchment'
                      }`}
                    >
                      {/* Left timeline circle index */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold font-mono z-10 border transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-canvas border-hairline text-muted-ink'
                        }`}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-semibold truncate transition-colors ${isSelected ? 'text-primary' : 'text-ink'}`}>
                          {sec.title}
                        </h4>
                        <p className="text-[10px] text-muted-ink font-mono mt-0.5">
                          Pages {sec.pageStart} - {sec.pageEnd}
                        </p>
                      </div>

                      <div className="flex items-center text-muted-ink">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Detailed content preview & AI Insights */}
            <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
              {selectedSection && (
                <>
                  {/* Content Preview Block */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-primary font-mono tracking-widest">
                        Section Outline Content
                      </span>
                      <h4 className="text-lg font-semibold text-ink mt-1 tracking-apple-headline">{selectedSection.title}</h4>
                      <p className="text-xs text-muted-ink font-mono mt-0.5 select-none">
                        Pages {selectedSection.pageStart} to {selectedSection.pageEnd}
                      </p>
                    </div>

                    {/* Preview Text */}
                    <div className="bg-canvas-parchment p-4 rounded-[12px] border border-hairline text-ink text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {selectedSection.content}
                    </div>

                    {/* Summary & Suggested Questions */}
                    <div className="border-t border-hairline pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 select-none">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold text-ink text-sm tracking-apple-headline">Section Key Takeaways</h4>
                        </div>

                        {!activeInsights && !isInsightsLoading && (
                          <button
                            onClick={() => generateInsights(selectedSection.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-full text-[11px] font-semibold transition-all active:scale-95 shadow-sm"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Generate Key Takeaways</span>
                          </button>
                        )}
                      </div>

                      {isInsightsLoading ? (
                        <div className="flex items-center justify-center p-6 text-xs text-muted-ink font-mono bg-canvas-parchment rounded-[12px] border border-hairline border-dashed select-none">
                          <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                          <span>Generating summary and suggesting questions...</span>
                        </div>
                      ) : activeInsights ? (
                        <div className="space-y-4">
                          {/* Executive Summary Card */}
                          <div className="p-4 bg-primary/5 border border-primary/20 rounded-[12px] flex gap-3">
                            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-[11px] font-semibold uppercase text-primary tracking-wider select-none">
                                Executive Summary
                              </h5>
                              <p className="text-xs text-body-ink mt-1 leading-relaxed font-normal">
                                {activeInsights.summary}
                              </p>
                            </div>
                          </div>

                          {/* Grounded Questions Suggestion */}
                          <div className="space-y-2.5">
                            <h5 className="text-[11px] font-semibold uppercase text-muted-ink tracking-wider flex items-center gap-1.5 select-none">
                              <HelpCircle className="w-4 h-4 text-primary" />
                              <span>Explore Grounded Questions</span>
                            </h5>

                            <div className="grid grid-cols-1 gap-2">
                              {activeInsights.questions.map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    onClose();
                                    navigate(`/chat?documentId=${documentId}&query=${encodeURIComponent(q)}`);
                                  }}
                                  className="w-full text-left p-3 bg-canvas hover:bg-primary/5 border border-hairline hover:border-primary/30 text-xs text-ink hover:text-primary rounded-[12px] transition-all flex items-center justify-between gap-3 group active:scale-[0.98]"
                                >
                                  <span>"{q}"</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-muted-ink group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-ink font-mono bg-canvas-parchment rounded-[12px] border border-hairline border-dashed select-none">
                          No insights generated. Click the button above to analyze this section.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
