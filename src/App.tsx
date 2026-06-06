/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Search, AlertCircle, Loader2, Play, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import AnalysisCards from './components/AnalysisCards';
import TranscriptBox from './components/TranscriptBox';
import VideoSubtitlesVisualizer from './components/VideoSubtitlesVisualizer';
import ExportActions from './components/ExportActions';
import VideoDetailsCard from './components/VideoDetailsCard';
import SentimentDistributionChart from './components/SentimentDistributionChart';
import LoadingIndicator from './components/LoadingIndicator';
import HistoryList from './components/HistoryList';
import ApiKeySettings from './components/ApiKeySettings';
import ManualTranscriptInput from './components/ManualTranscriptInput';
import PrintFriendlyReport from './components/PrintFriendlyReport';
import { DEFAULT_TRANSCRIPT_TEXT } from './data/defaultTranscript';
import type { AnalyzeResponse, HistoryItem } from './types';

export default function App() {
  const [url, setUrl] = useState('https://m.youtube.com/watch?v=W4z3jCQGFYY&pp=iggUQAFKEGM4VWNNZEU4NTVOVXpYWGo%3D');
  const [manualTranscript, setManualTranscript] = useState(DEFAULT_TRANSCRIPT_TEXT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leakedKeyInfo, setLeakedKeyInfo] = useState<{ actionUrl: string } | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });
  const [extractionMode, setExtractionMode] = useState<string>(() => {
    return localStorage.getItem('extraction_mode') || 'hybrid_fallback';
  });
  const [backupApiUrl, setBackupApiUrl] = useState<string>(() => {
    return localStorage.getItem('backup_api_url') || 'https://youtube-transcript.io/';
  });
  const [showPrintMode, setShowPrintMode] = useState(false);

  const DEFAULT_URL = 'https://m.youtube.com/watch?v=W4z3jCQGFYY&pp=iggUQAFKEGM4VWNNZEU4NTVOVXpYWGo%3D';

  useEffect(() => {
    const saved = localStorage.getItem('analysis_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const saveToHistory = (targetUrl: string, response: AnalyzeResponse) => {
    const newItem: HistoryItem = {
      url: targetUrl,
      timestamp: new Date().toISOString(),
      title: response.videoDetails?.channelName ? `تحلیل کانال ${response.videoDetails.channelName}` : 'ویدیوی یوتیوب',
      summary: response.analysis.summary,
      compassionLevel: response.analysis.compassionLevel
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.url !== targetUrl);
      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem('analysis_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAnalyze = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setLeakedKeyInfo(null);
    setData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'fa' 
        },
        body: JSON.stringify({ url, customApiKey, extractionMode, backupApiUrl, manualTranscript }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.errorType === 'API_KEY_LEAKED') {
          setLeakedKeyInfo({ actionUrl: result.actionUrl });
        }
        throw new Error(result.message || 'خطا در تحلیل ویدیو. لطفاً آدرس را بررسی کرده و دوباره امتحان کنید.');
      }

      setData(result);
      saveToHistory(url, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای غیرمنتظره‌ای رخ داد');
    } finally {
      setLoading(false);
    }
  };

  const setExample = () => {
    setUrl(DEFAULT_URL);
    setManualTranscript(DEFAULT_TRANSCRIPT_TEXT);
  };

  const handleSelectHistory = (selectedUrl: string) => {
    setUrl(selectedUrl);
    // Use window.scrollTo to bring user back to input if they aren't there
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    localStorage.removeItem('analysis_history');
    setHistory([]);
  };

  if (showPrintMode && data) {
    return (
      <PrintFriendlyReport 
        data={data} 
        url={url || DEFAULT_URL} 
        onClose={() => setShowPrintMode(false)} 
      />
    );
  }

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

          <ApiKeySettings 
            savedKey={customApiKey}
            onSave={(key) => {
              setCustomApiKey(key);
              localStorage.setItem('custom_gemini_api_key', key);
            }}
            onClear={() => {
              setCustomApiKey('');
              localStorage.removeItem('custom_gemini_api_key');
            }}
            extractionMode={extractionMode}
            onExtractionModeChange={(mode) => {
              setExtractionMode(mode);
              localStorage.setItem('extraction_mode', mode);
            }}
            backupApiUrl={backupApiUrl}
            onBackupApiUrlChange={(url) => {
              setBackupApiUrl(url);
              localStorage.setItem('backup_api_url', url);
            }}
          />

          <ManualTranscriptInput 
            manualTranscript={manualTranscript}
            onTranscriptChange={setManualTranscript}
          />

          <HistoryList 
            history={history} 
            onSelect={handleSelectHistory} 
            onClear={clearHistory} 
          />

          <AnimatePresence mode="wait">
            {loading && (
              <LoadingIndicator key="loading-indicator" />
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 overflow-hidden shadow-2xl shadow-slate-200/50"
              >
                <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row gap-6 items-start text-right transition-all ${leakedKeyInfo ? 'bg-slate-900 border-slate-800 text-white' : 'bg-red-50 border-red-100 text-red-900'}`}>
                  <div className={`p-4 rounded-2xl shadow-lg shrink-0 ${leakedKeyInfo ? 'bg-red-500' : 'bg-red-100'}`}>
                    <AlertCircle className={`w-8 h-8 ${leakedKeyInfo ? 'text-white' : 'text-red-500'}`} />
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <h3 className={`text-xl font-bold ${leakedKeyInfo ? 'text-white' : 'text-red-950'}`}>
                        {leakedKeyInfo ? 'امنیت حساب شما به خطر افتاده است' : 'بروز خطای سیستمی'}
                      </h3>
                      <p className={`text-sm font-medium leading-relaxed ${leakedKeyInfo ? 'text-slate-300' : 'text-red-800'}`}>
                        {error}
                      </p>
                    </div>

                    {leakedKeyInfo && (
                      <div className="space-y-6 pt-4 border-t border-slate-800">
                        <p className="text-sm text-slate-400 leading-relaxed font-light">
                          گوگل متوجه شده است که این کلید API در یک محیط عمومی (مثل گیت‌هاب یا یک مخزن کد باز) فاش شده است. برای حفظ امنیت و جلوگیری از سوءاستفاده‌های هزینه احتمالی، دسترسی این کلید مسدود شده است.
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
                          <a 
                            href={leakedKeyInfo.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                          >
                            دریافت کلید API جدید (رایگان)
                            <CheckCircle className="w-5 h-5" />
                          </a>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            پس از دریافت، کلید را در بخش SETTINGS جایگزین کنید.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {data && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 mt-12"
              >
                {(data.usingMockData || data.realTranscriptFetched || data.errorOccurred) && (
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
                            ? data.manualImportUsed
                              ? "📥 رونوشت/زیرنویس دستی شما با موفقیت بارگذاری و تحلیل شد"
                              : data.backupApiUsed 
                                ? "📡 استخراج موفق زیرنویس از سرور پشتیبان مستقل"
                                : "✅ داده‌های واقعی ویدیو با موفقیت دریافت شد" 
                            : data.errorOccurred
                              ? "⚠️ خطای سیستمی (پیکربندی کلید یا سهمیه)"
                              : data.transcriptDisabled
                                ? "✨ بازسازی هوشمند محتوای ویدیو توسط هوش مصنوعی (AI Grounding)"
                                : data.isSimulated 
                                  ? "در حال نمایش تحلیل شبیه‌سازی شده (Grounded Simulation)"
                                  : "توجه: در حال مشاهده داده‌های محدود یا شبیه‌سازی شده"}
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90 font-medium">
                          {data.authError
                            ? "🚨 کلید API شما به دلیل نشت امنیتی مسدود شده است. گوگل کلیدهایی را که در محیط‌های عمومی دیده شوند باطل می‌کند. لطفاً از منوی Settings یک کلید جدید وارد کنید."
                            : data.manualImportUsed
                              ? data.errorOccurred
                                ? "رونوشت/زیرنویس وارد شده مکتوب شما به دلیل محدودیت یا مسدود بودن کلید پیش‌فرض سیستم، با متدولوژی ارزیابی دقیق واژگان بومی با موفقیت تحلیل گردید."
                                : "رونوشت/زیرنویس وارد شده به صورت دستی توسط شما به عنوان منبع موثق تحلیل با موفقیت توسط مدل زنده Gemini پردازش گردید."
                            : data.modelError
                              ? "مدل هوش‌مصنوعی در دسترس نیست. این مورد ممکن است به دلیل محدودیت‌های ریجن باشد."
                              : data.backupApiUsed
                                ? "زیرنویس‌های این ویدیو به کمک سرور مستقل ثانویه با موفقیت بازخوانی و استخراج گردید."
                                : data.transcriptDisabled
                                  ? "زیرنویس‌های رسمی غیرفعال هستند یا حالت بازسازی هوش مصنوعی انتخاب شده است. فرآیند بازخوانی متن با سیستم Grounded Search در Gemini شبیه‌سازی گردید."
                                  : data.isSimulated
                                    ? "به دلیل عدم دسترسی به تحلیل زنده (خطای API یا نبود زیرنویس)، یک تحلیل تخمینی بر اساس دانش درونی مدل ارائه شده است."
                                    : data.realTranscriptFetched 
                                      ? "زیرنویس‌های اصلی ویدیو مستقیماً و به صورت اورجینال از یوتیوب استخراج شده است."
                                      : data.quotaExceeded
                                        ? "سهمیه رایگان هوش‌مصنوعی به اتمام رسیده است."
                                        : data.missingApiKey 
                                          ? "کلید API تنظیم نشده است؛ در حال نمایش نمونه."
                                          : data.errorOccurred
                                            ? "جزئیات خطا در بخش 'متن کامل ویدیو' درج شده است."
                                            : "این ویدیو به عنوان نمونه تحلیل شده است."}
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
                <ExportActions 
                  data={data} 
                  onOpenPrintView={() => setShowPrintMode(true)} 
                />
                <VideoSubtitlesVisualizer transcript={data.transcript} videoDetails={data.videoDetails} />
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
