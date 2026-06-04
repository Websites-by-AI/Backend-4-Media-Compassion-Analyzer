/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Search, AlertCircle, Loader2, Play, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import AnalysisCards from './components/AnalysisCards';
import TranscriptBox from './components/TranscriptBox';
import ExportActions from './components/ExportActions';
import VideoDetailsCard from './components/VideoDetailsCard';
import SentimentDistributionChart from './components/SentimentDistributionChart';
import type { AnalyzeResponse } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const DEFAULT_URL = 'https://m.youtube.com/watch?v=W4z3jCQGFYY&pp=iggUQAFKEGM4VWNNZEU4NTVOVXpYWGo%3D';

  const handleAnalyze = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'fa' // Hint for the backend to return Farsi if possible
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در تحلیل ویدیو. لطفاً آدرس را بررسی کرده و دوباره امتحان کنید.');
      }

      const result: AnalyzeResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای غیرمنتظره‌ای رخ داد');
    } finally {
      setLoading(false);
    }
  };

  const setExample = () => {
    setUrl(DEFAULT_URL);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <Header />

        <main className="mt-12">
          {/* Search Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-red-100 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <form 
              onSubmit={handleAnalyze}
              className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-3xl shadow-sm border border-slate-200"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <Youtube className="w-6 h-6 text-red-500 shrink-0" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="آدرس یوتیوب را اینجا وارد کنید..."
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium text-right"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !url.trim()}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'در حال تحلیل...' : 'تحلیل ویدیو'}
              </button>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={setExample}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors border border-dashed border-slate-300 rounded-full hover:border-slate-400"
            >
              <Play className="w-3 h-3 fill-current rotate-180" />
              بارگذاری ویدیوی نمونه (تحلیل سیاسی/اجتماعی)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </motion.div>
            )}

            {data && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 mt-12"
              >
                {(data.usingMockData || data.realTranscriptFetched) && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-5 rounded-3xl border shadow-sm ${data.realTranscriptFetched ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${data.realTranscriptFetched ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        {data.realTranscriptFetched ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">
                          {data.realTranscriptFetched 
                            ? "داده‌های واقعی ویدیو با موفقیت دریافت شد" 
                            : data.isSimulated 
                              ? "در حال نمایش تحلیل شبیه‌سازی شده (Grounded Simulation)"
                              : "توجه: در حال مشاهده داده‌های محدود یا شبیه‌سازی شده"}
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90 font-medium">
                          {data.authError
                            ? "متأسفانه کلید API شما به دلیل نشت امنیتی (Leaked) غیرفعال شده است. گوگل کلیدهایی را که در معرض دید عمومی قرار بگیرند بلافاصله مسدود می‌کند. لطفاً به بخش Settings در منوی سمت چپ بروید، کلید فعلی را حذف و یک کلید جدید جایگزین کنید."
                            : data.modelError
                              ? "مدل هوش‌مصنوعی در دسترس نیست. این مورد ممکن است به دلیل محدودیت‌های ریجن یا عدم پشتیبانی کلید API شما از این سرویس باشد."
                              : data.isSimulated
                                ? "به دلیل عدم دسترسی به تحلیل زنده (خطای API یا نبود زیرنویس)، یک تحلیل تخمینی بر اساس دانش درونی مدل از این ویدیوی معروف ارائه شده است."
                              : data.transcriptDisabled
                                ? "زیرنویس‌های این ویدیو توسط بارگذار غیرفعال شده است؛ لذا تحلیل صرفاً بر اساس محتوای احتمالی لینک انجام شده است."
                              : data.realTranscriptFetched 
                                ? "زیرنویس‌های اصلی ویدیو مستقیماً از یوتیوب استخراج و توسط هوش مصنوعی تحلیل شده است."
                                : data.quotaExceeded
                                  ? "سهمیه رایگان هوش‌مصنوعی به اتمام رسیده است. برای رفع این محدودیت، کلید اختصاصی خود را در Settings وارد کنید."
                                  : data.missingApiKey 
                                    ? "به دلیل عدم تنظیم کلید API، سیستم از حالت تحلیل واقعی خارج شده و یک نمونه تحلیل از پیش آماده شده را نمایش می‌دهد."
                                    : "این ویدیو به عنوان نمونه یا با استفاده از دانش پیشین مدل (Grounding) تحلیل شده است."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {data.videoDetails && (
                  <VideoDetailsCard details={data.videoDetails} url={url || DEFAULT_URL} />
                )}
                {data.sentimentTimeline && (
                  <SentimentDistributionChart timeline={data.sentimentTimeline} />
                )}
                <AnalysisCards data={data.analysis} />
                <ExportActions data={data} />
                <TranscriptBox transcript={data.transcript} />
              </motion.div>
            )}

            {!data && !loading && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-24 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex -space-x-2 space-x-reverse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://i.pravatar.cc/100?img=${i + 13}`} 
                          alt="User" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="mr-4 text-sm font-medium text-slate-500">
                    مورد اعتماد بیش از ۵۰۰ پژوهشگر
                  </span>
                </div>
                <h4 className="text-slate-400 text-sm font-medium">آماده شروع تحلیل هستید؟</h4>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
