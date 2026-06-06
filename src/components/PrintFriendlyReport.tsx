/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Printer, ArrowLeft, Info, Heart, Scale, MessageCircle, FileText, Globe, Clock, Video } from 'lucide-react';
import type { AnalyzeResponse } from '../types';

interface PrintFriendlyReportProps {
  data: AnalyzeResponse;
  url: string;
  onClose: () => void;
}

export default function PrintFriendlyReport({ data, url, onClose }: PrintFriendlyReportProps) {
  // Score parsing helpers
  const getScore = (text: string, isBias = false) => {
    const num = text.match(/(\d+)/);
    if (num) return Math.min(parseInt(num[0]), 100);
    
    const t = text.toLowerCase();
    if (t.includes("بسیار بالا")) return 95;
    if (t.includes("بالا")) return 75;
    if (t.includes("متوسط")) return 50;
    if (t.includes("کم") || t.includes("ناچیز")) return 25;
    if (t.includes("بسیار کم") || t.includes("خنثی")) return 10;
    
    return isBias ? 20 : 60;
  };

  const compassionScore = getScore(data.analysis.compassionLevel);
  const biasScore = getScore(data.analysis.bias, true);

  // Parse transcript into timed chunks
  const parseTranscript = (text: string) => {
    if (!text) return [];
    const regex = /(\[\d{2,}:\d{2}\])/g;
    const parts = text.split(regex);
    const result: { time: string; content: string }[] = [];
    
    let currentTimestamp = "[00:00]";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      if (part.match(/^\[\d{2,}:\d{2}\]$/)) {
        currentTimestamp = part;
      } else {
        // If the previous item was not a timestamp, we append or add
        result.push({
          time: currentTimestamp,
          content: part.replace(/^\[موسیقی\]\s*/i, '').trim()
        });
      }
    }
    return result;
  };

  const parsedTranscript = parseTranscript(data.transcript);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:p-0 print:m-0" dir="rtl">
      {/* Interactive Toolbar - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
            title="بازگشت به کنترل پنل"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">پیش‌نمایش نسخه چاپی گزارش</h1>
            <p className="text-xs text-slate-400">سند ارزیابی عینی با قابلیت خروجی مستقیم به فایل PDF</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            چاپ آ۴ یا خروجی PDF
          </button>
        </div>
      </div>

      {/* Helpful Instructions Alert - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 print:hidden">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-right">
          <h4 className="text-sm font-bold text-blue-900 mb-1">💡 راهنمای ذخیره به عنوان فایل PDF استاندارد:</h4>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            پس از کلیک بر روی دکمه <span className="font-bold">«چاپ آ۴ یا خروجی PDF»</span>، در پنجره باز شده مرورگر، مقدار مقصد <span className="font-bold">(Destination)</span> را روی گزینه <span className="font-bold">Save as PDF</span> یا <span className="font-bold">ذخیره به عنوان PDF</span> تنظیم نمایید. همچنین گزینه پاصفحه و سرصفحه مروگر را بردارید تا سندی بی‌نقص و رسمی تولید شود.
          </p>
        </div>
      </div>

      {/* THE ACTUAL PRINTABLE REPORT MARKUP */}
      <article 
        id="print-report-container"
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-md border border-slate-200/60 p-10 print:shadow-none print:border-none print:p-0 print:mx-0 print:my-0 print:max-w-none text-right"
      >
        {/* Academic / Policy Brief Header */}
        <header className="border-b-4 border-slate-900 pb-6 mb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">سامانه ارزیابی هوشمند محتوای رسانه</span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">سند فنی تحلیل همدلی، روابط انسانی و سوگیری رسانه‌ای</h1>
              <p className="text-xs text-slate-500 mt-1">خروجی تصدیق‌شده سیستم با پردازش شناختی مدل Gemini-3.5</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-left md:text-right shrink-0 print:bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">شناسه سند تحلیلی</span>
              <span className="font-mono text-xs font-bold text-slate-700 block">MCA-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block">مرجع محتوا / کانال:</span>
              <span className="font-bold text-slate-700 block">{data.videoDetails?.channelName || "نامشخص"}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block">دسته‌بندی موضوعی:</span>
              <span className="font-bold text-slate-700 block">{data.videoDetails?.category || "کلی"}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block">مدت زمان منبع:</span>
              <span className="font-mono font-bold text-slate-700 block">{data.videoDetails?.duration || "نامشخص"}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block">تاریخ استخراج سند:</span>
              <span className="font-bold text-slate-700 block">{new Date().toLocaleDateString('fa-IR')}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center gap-2 text-slate-600 print:bg-slate-50">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold shrink-0">آدرس وب منبع:</span>
            <span className="font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap block" dir="ltr">{url}</span>
          </div>
        </header>

        {/* BENTO MEASURES FOR PRINT */}
        <section className="print-card-break-avoid grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Compassion print item */}
          <div className="p-6 rounded-2xl border border-red-100 bg-red-50/50 print:bg-red-50/30">
            <div className="flex items-center gap-2.5 mb-3">
              <Heart className="w-5 h-5 text-red-500 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">شاخص همدلی و مهربانی (Compassion)</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-red-650">{compassionScore}%</span>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                {compassionScore >= 75 ? "مطلوب و انسانی" : compassionScore >= 45 ? "متعادل / متوسط" : "شدیداً انتقادی / کم‌ترمهربان"}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.analysis.compassionLevel}
            </p>
          </div>

          {/* Bias print item */}
          <div className="p-6 rounded-2xl border border-amber-100 bg-amber-50/50 print:bg-amber-50/30">
            <div className="flex items-center gap-2.5 mb-3">
              <Scale className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">بررسی سطح سوگیری رسانه‌ای (Bias Index)</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-amber-700">{biasScore}%</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {biasScore < 35 ? "عینی و متوازن" : biasScore < 65 ? "سوگیری جانبی متوسط" : "سوگیری جهت‌دار شدید"}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {data.analysis.bias}
            </p>
          </div>
        </section>

        {/* EMOTIONAL TONE ACCENT */}
        <section className="print-card-break-avoid p-5 rounded-2xl border border-blue-100 bg-blue-50/40 mb-8 print:bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-500 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm">لحن عاطفی گفتار (Emotional Tone Keynote)</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-semibold">
            {data.analysis.tone}
          </p>
        </section>

        {/* SECTION 1: BALANCED BRIEF */}
        <section className="print-card-break-avoid mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-800 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">۱. خلاصه تحلیلی و تبیین متوازن موضوع</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium text-justify">
            {data.analysis.summary}
          </p>
        </section>

        {/* SECTION 2: CLAIMS ASSESSMENT */}
        <section className="print-card-break-avoid mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-slate-800 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">۲. گزاره‌ها و ادعاهای محوری منبع محتوا</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">گزاره‌های اثبات‌شده یا جبهه‌گیری‌های عاطفی اصلی به شرح زیر تفکیک می‌گردند:</p>
          <ul className="space-y-3">
            {data.analysis.keyClaims.map((claim, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-700 font-medium">
                <span className="shrink-0 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{claim}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION 3: SENTIMENT TIMELINE TABLE */}
        {data.sentimentTimeline && data.sentimentTimeline.length > 0 && (
          <section className="print-card-break-avoid mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-800 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">۳. خط سیر احساسی و فراز و فرود لحن مهربانی</h2>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 w-24">زمان</th>
                    <th scope="col" className="px-4 py-2.5 w-32 text-center">شاخص عاطفی</th>
                    <th scope="col" className="px-4 py-2.5">برچسب تحلیل لحن و موقعیت عاطفی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.sentimentTimeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-500 text-xs">{item.time}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                          item.sentimentValue > 40
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : item.sentimentValue > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : item.sentimentValue < -40
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {item.sentimentValue > 0 ? `+${item.sentimentValue}%` : `${item.sentimentValue}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs leading-relaxed">{item.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 4: FULL DOCUMENT TRANSCRIPT - BREAK OVER PAGES BEAUTIFULLY */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4 breaking-page">
            <Video className="w-5 h-5 text-slate-800 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">۴. رونوشت مکتوب و ثبت زمانی محتوا (Transcript)</h2>
          </div>
          
          <div className="space-y-4">
            {parsedTranscript && parsedTranscript.length > 0 ? (
              parsedTranscript.map((block, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-colors break-inside-avoid print:break-inside-avoid"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 print:bg-slate-100">
                      ⏱️ {block.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold text-justify whitespace-pre-line">
                    {block.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                رونوشت زمانی موجود نیست یا فرمت داده ثبت‌نشده است.
              </div>
            )}
          </div>
        </section>

        {/* DOCUMENT SIGNATURE AND AUTHENTICATION FOR PRINT */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row justify-between gap-4 items-center print:border-slate-300">
          <p className="text-center sm:text-right font-medium leading-relaxed">
            این گزارش مستقل توسط سیستم سنجش هوش مصنوعی با بهره‌گیری از داده‌های بومی یوتیوب پردازش شده است. 
            <br />
            تایید نهایی صحت مطالب منوط به پایش انسانی تحلیلگران مجاز است.
          </p>
          <div className="text-center sm:text-left font-mono font-bold shrink-0">
            Powered by Gemini AI • Media Compassion
          </div>
        </footer>
      </article>
    </div>
  );
}
