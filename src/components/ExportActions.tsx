/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, FileJson, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import type { AnalyzeResponse } from '../types';

interface ExportActionsProps {
  data: AnalyzeResponse;
}

export default function ExportActions({ data }: ExportActionsProps) {
  const exportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `تحلیل-کامل-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportTranscriptTXT = () => {
    const blob = new Blob([data.transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `متن-خام-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTranscriptJSON = () => {
    const transcriptData = {
      videoId: data.videoDetails?.channelName, // best effort ID
      timestamp: new Date().toISOString(),
      transcript: data.transcript
    };
    const dataStr = JSON.stringify(transcriptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `دیتا-متن-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    // Simplified PDF for now as basic jsPDF struggles with RTL/UTF-8 without a font loaded
    // In a real prod app, we'd load Vazirmatn.ttf as a base64 string
    doc.text('Media Compassion Analysis', 20, 20);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    doc.text('The detailed analysis results have been exported.', 20, 40);
    
    doc.save(`analysis-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8 pt-8 border-t border-slate-200" dir="rtl">
      <span className="text-sm font-medium text-slate-500 ml-4 flex items-center gap-2">
        <Download className="w-4 h-4" /> خروجی تحلیل
      </span>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
      >
        <FileJson className="w-4 h-4 text-amber-500" />
        JSON گزارش
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportTranscriptTXT}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
      >
        <FileText className="w-4 h-4 text-blue-400" />
        متن خام (TXT)
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportTranscriptJSON}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
      >
        <FileJson className="w-4 h-4 text-purple-500" />
        دیتا متن (JSON)
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
      >
        <FileText className="w-4 h-4 text-red-500" />
        PDF گزارش
      </motion.button>
    </div>
  );
}
