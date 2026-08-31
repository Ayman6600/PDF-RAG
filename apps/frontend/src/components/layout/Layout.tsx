import React from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { PDFViewerModal } from '../pdf/PDFViewerModal';
import { useAuth } from '../../context/AuthContext';
import { PanelLeftOpen } from 'lucide-react';

const LayoutContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewPdfId = searchParams.get('viewPdf');
  const pdfName = searchParams.get('pdfName') || 'Document';

  const closePDFViewer = () => {
    searchParams.delete('viewPdf');
    searchParams.delete('pdfName');
    setSearchParams(searchParams);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas-parchment font-sans">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-canvas">
          <Outlet />
        </main>
        {/* Global PDF Viewer Modal */}
        {viewPdfId && (
          <PDFViewerModal
            isOpen={true}
            onClose={closePDFViewer}
            documentId={viewPdfId}
            documentName={pdfName}
            initialPage={1}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas-parchment font-sans">
      {/* Global Nav Bar (Apple standard thin black header) */}
      <nav className="h-[44px] bg-[#000000] text-[#f5f5f7] flex items-center px-6 z-40 shrink-0 select-none">
        <span className="text-[12px] font-semibold tracking-apple-tight text-white flex items-center gap-1.5 cursor-pointer">
           RAG-PDF Platform
        </span>
      </nav>

      {/* Main Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Animated Sidebar wrapper */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out border-r border-hairline overflow-hidden flex ${
            isCollapsed ? 'w-0' : 'w-72'
          }`}
        >
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-canvas">
          {/* Floating Expand Sidebar Button */}
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute left-4 top-3.5 z-40 p-1 bg-canvas hover:bg-canvas-parchment text-muted-ink hover:text-ink rounded-full transition-all active:scale-95 border border-hairline shadow-sm cursor-pointer"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-canvas">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global PDF Viewer Modal */}
      {viewPdfId && (
        <PDFViewerModal
          isOpen={true}
          onClose={closePDFViewer}
          documentId={viewPdfId}
          documentName={pdfName}
          initialPage={1}
        />
      )}
    </div>
  );
};

export const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};
