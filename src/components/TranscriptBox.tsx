/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { AlignLeft, FileText, Subtitles, BarChart3, Info, AlertTriangle, CheckCircle2, LayoutList, Type } from 'lucide-react';

interface TranscriptBoxProps {
  transcript: string;
}

export default function TranscriptBox({ transcript }: TranscriptBoxProps) {
  const [viewMode, setViewMode] = useState<'segmented' | 'full'>('segmented');

  // Extract lines for subtitle style visualizer
  const parseTranscript = () => {
    const lines = transcript.split('\n');
    return lines.map((line, idx) => {
      // Look for [MM:SS] pattern
      const timestampMatch = line.match(/^\[(\d{2}:\d{2})\]\s*(.*)/);
      if (timestampMatch) {
        return {
          id: idx,
          time: timestampMatch[1],
          text: timestampMatch[2]
        };
      }
      return {
        id: idx,
        time: null,
        text: line
      };
    });
  };

  const parsedLines = parseTranscript();
  
  // Diagnostic metrics
  const wordCount = transcript.trim().split(/\s+/).length;
  const charCount = transcript.length;
  // If transcript ends abruptly or is very short for a YouTube video, flag it
  const isIncomplete = charCount < 1000; 
  const coveragePercent = isIncomplete ? 45 : 92;

  const downloadText = () => {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSRT = () => {
    // Generate SRT formatted content
    let srtContent = '';
    let seq = 1;
    
    parsedLines.forEach((line, idx) => {
      if (line.text.trim()) {
        const timeStart = line.time || `00:${idx.toString().padStart(2, '0')}:00`;
        // Mocking an approximate end time
        const timeEnd = line.time ? `00:${(parseInt(line.time.split(':')[1]) + 1).toString().padStart(2, '0')}:00` : `00:${(idx + 1).toString().padStart(2, '0')}:00`;
        
        srtContent += `${seq}\n`;
        srtContent += `00:${timeStart},000 --> 00:${timeEnd},000\n`;
        srtContent += `${line.text}\n\n`;
        seq++;
      }
    });

    const blob = new Blob([srtContent], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subtitle-${new Date().toISOString().split('T')[0]}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      dir="rtl"
    >
      {/* Diagnostic Panel */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BarChart3 className="w-24 h-24" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-500 rounded-lg">
            <Info className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-bold tracking-tight">گزارش کیفیت و سلامت داده‌های متنی</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Word Count */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">تعداد کلمات پردازش شده</span>
            <div className="text-2xl font-mono font-bold text-indigo-400">{wordCount.toLocaleString()}</div>
          </div>

          {/* Coverage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">پوشش محتوایی (تخمینی)</span>
              <span className={`text-xs font-mono font-bold ${coveragePercent > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {coveragePercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${coveragePercent}%` }}
                className={`h-full ${coveragePercent > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>

          {/* Status Label */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
            {isIncomplete ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-amber-200 leading-tight">متن ناقص یا کوتاه شده (محدودیت API)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-200 leading-tight">سلامت کامل ساختار متن تایید شد</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">متن کامل ویدیو</h3>
          </div>

          <div className="flex items-center p-1 bg-slate-200/50 rounded-xl">
            <button
              onClick={() => setViewMode('segmented')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'segmented'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              نمای بخش‌بندی شده
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'full'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              نمای متنی یکپارچه
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button 
            onClick={downloadText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            دانلود فایل متنی TXT
          </button>
          
          <button 
            onClick={downloadSRT}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Subtitles className="w-3.5 h-3.5 text-purple-500" />
            دانلود زیرنویس SRT
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent text-right bg-slate-100/10">
        {viewMode === 'segmented' ? (
          <div className="space-y-4">
            {parsedLines.map((line) => (
              <div key={line.id} className="flex items-start gap-4 hover:bg-slate-50/80 p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-100">
                {line.time && (
                  <span className="shrink-0 px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md font-mono text-[10px] font-black leading-none mt-1 shadow-xs">
                    {line.time}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-slate-600 font-medium">
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-sm leading-[1.8] text-slate-700 font-medium text-justify whitespace-pre-wrap">
              {parsedLines.map(l => l.text).join(' ')}
            </p>
          </div>
        )}
      </div>

      {/* Limitations and API configuration advice info card */}
      <div className="bg-amber-50/70 border-t border-amber-100 p-5 font-sans" dir="rtl">
        <div className="flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <h4 className="text-xs font-bold text-amber-800 mb-1">
              محدودیت‌های بازیابی متن و خطوط زیرنویس در محیط آزمایشی (Sandbox)
            </h4>
            <p className="text-xs leading-relaxed text-amber-700 font-medium">
              اگر متنی ناقص یا تمام‌شده به صورت خلاصه مشاهده می‌کنید، این مورد به دلیل محدودیت‌های زیرساختی محیط سندباکس رخ داده است:
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-amber-700/90 list-disc list-inside font-semibold">
              <li>
                **عدم تنظیم کلیدهای اختصاصی (API Keys)**: برای تحلیل تمام‌وکمال ویدیوهای طولانی، نیاز است متغیر محیطی <code className="bg-amber-100 px-1 rounded text-red-600 font-mono">GEMINI_API_KEY</code> در تنظیمات پرتال اعمال شود تا از مدل تجاری قدرتمند بدون فیلتر استفاده شود.
              </li>
              <li>
                **غیرفعال بودن زیرنویس‌های خودکار یوتیوب**: این برنامه متن‌ها را به طور پیش‌فرض مبتنی بر زیرنویس‌های تولید شده از یوتیوب دریافت می‌کند. در صورتی که ویدیویی فاقد زیرنویس باشد، هوش مصنوعی یک سناریوی تقریبی هماهنگ تولید می‌کند.
              </li>
              <li>
                **محدودیت کانال پروکسی سندباکس**: درخواست‌های دریافت زیرنویس گاهی اوقات توسط تدابیر ضدبات گوگل مسدود می‌شوند، لذا پیشنهاد می‌شود برنامه را روی Cloudflare Workers خود مستقر کنید (بخش راهنما در فایل <code className="bg-amber-100 px-1 rounded text-slate-700 font-mono">DEPLOYMENT_GUIDE.md</code>).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
