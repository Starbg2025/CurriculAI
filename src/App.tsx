/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { CVData, initialCVData } from './types';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const cvRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!cvRef.current) return;
    setIsExportingPdf(true);
    
    try {
      const element = cvRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800 // Consistent width for CV rendering
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_') || 'CV'}_CurriculAI.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex flex-col font-sans text-slate-800 relative">
      {/* Off-screen container for printing - always in DOM but not visible to user */}
      <div className="absolute -top-[10000px] -left-[10000px] pointer-events-none no-print">
        <div ref={cvRef} className="w-[800px] bg-white">
          <CVPreview data={cvData} />
        </div>
      </div>

      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-stone-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#889E81] rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight italic leading-none truncate max-w-[120px] md:max-w-none">CurriculAI</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-[#3E4E50] text-white rounded-xl text-xs md:text-sm font-bold hover:bg-[#2C3839] transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 shrink-0" />}
            <span>PDF</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col xl:flex-row relative overflow-y-auto xl:overflow-hidden">
        <div className="w-full flex flex-col xl:flex-row h-full p-4 md:p-6 gap-6">
          {/* Editor Area */}
          <div className="w-full xl:flex-1 max-w-2xl mx-auto h-fit xl:h-full xl:overflow-y-auto bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <CVForm data={cvData} onChange={setCvData} />
          </div>

          {/* Side Preview (Always visible) */}
          <div className="w-full xl:w-[600px] h-fit xl:h-full bg-[#E8E7E0] rounded-3xl p-4 md:p-8 flex items-start justify-center overflow-hidden xl:overflow-y-auto no-print">
            <div className="scale-[0.6] sm:scale-[0.8] xl:scale-[0.7] origin-top transition-all">
              <CVPreview data={cvData} />
            </div>
          </div>
        </div>
      </main>

      {/* Credit Footer */}
      <footer className="h-10 bg-white border-t border-stone-200 flex items-center justify-center">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
          Créé par <span className="text-[#889E81]">Benit Madimba</span>
        </p>
      </footer>
    </div>
  );
}
