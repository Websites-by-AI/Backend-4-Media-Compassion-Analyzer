import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  HelpCircle,
  Cpu,
  Globe,
  Database,
  Sliders
} from 'lucide-react';

interface ApiKeySettingsProps {
  onSave: (key: string) => void;
  onClear: () => void;
  savedKey: string;
  extractionMode: string;
  onExtractionModeChange: (mode: string) => void;
  backupApiUrl: string;
  onBackupApiUrlChange: (url: string) => void;
}

export default function ApiKeySettings({ 
  onSave, 
  onClear, 
  savedKey,
  extractionMode,
  onExtractionModeChange,
  backupApiUrl,
  onBackupApiUrlChange
}: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState(savedKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [localBackupUrl, setLocalBackupUrl] = useState(backupApiUrl);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.message || 'اعتبارسنجی کلید ناموفق بود.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'خطا در برقراری ارتباط با سرور تست.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(apiKey.trim());
    setTestResult({ success: true, message: 'کلید با موفقیت در مرورگر شما ذخیره شد و اکنون اعمال گردیده است! 🚀' });
  };

  const handleClear = () => {
    setApiKey('');
    setTestResult(null);
    onClear();
  };

  const handleBackupUrlBlur = () => {
    onBackupApiUrlChange(localBackupUrl.trim());
  };

  const modeOptions = [
    {
      id: 'hybrid_fallback',
      title: 'ترکیبی هوشمند (توصیه شده)',
      desc: 'ابتدا تلاش برای استخراج مستقیم؛ در صورت نبود زیرنویس، سوئیچ خودکار بر روی سرور پشتیبان و سپس بازسازی با هوش مصنوعی Google Search.',
      icon: Cpu,
      color: 'border-blue-500 bg-blue-50/20 text-blue-600'
    },
    {
      id: 'direct_youtube',
      title: 'استخراج مستقیم یوتیوب',
      desc: 'فقط تلاش برای استخراج کدهای مستقیم زیرنویس یوتیوب (رایگان و بدون Quota رسمی).',
      icon: Database,
      color: 'border-purple-500 bg-purple-50/20 text-purple-600'
    },
    {
      id: 'backup_api',
      title: 'سرور پشتیبان مستقل (REST)',
      desc: 'فراخوانی آدرس فرعی سفارشی برای ویدیوهای فاقد تراک صوتی هماهنگ.',
      icon: Globe,
      color: 'border-emerald-500 bg-emerald-50/20 text-emerald-600'
    },
    {
      id: 'ai_reconstruct',
      title: 'بازسازی محض هوش مصنوعی',
      desc: 'بای‌پس کامل استخراج متن و تولید هوشمندانه مستند صوتی احتمالی با استفاده از موتور کاوش زنده Gemini.',
      icon: Sparkles,
      color: 'border-amber-500 bg-amber-50/20 text-amber-600'
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm mt-6 overflow-hidden">
      {/* Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-right"
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl transition-colors ${savedKey ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">پیکربندی پیشرفته ماژول‌های زیرنویس و کلید API</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              تنظیم شیوه استخراج متن، آدرس سرور پشتیبان مستقل، و کنترل کلید امنیتی اختصاصی
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedKey && (
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full select-none">
              کلید ذخیره شده
            </span>
          )}
          <span className="text-slate-400 text-xs">
            {isExpanded ? 'بستن منو ▴' : 'تنظیمات پیشرفته ▾'}
          </span>
        </div>
      </button>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/30"
          >
            <div className="p-6 space-y-6">
              
              {/* SECTION 1: EXTRACTION MODE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <h4>متدولوژی و ماژول استخراج متن زیرنویس:</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modeOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = extractionMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onExtractionModeChange(opt.id)}
                        type="button"
                        className={`p-4 rounded-2xl border text-right transition-all flex gap-3 ${isSelected ? `ring-2 ring-blue-500/25 bg-white ${opt.color}` : 'bg-white hover:bg-slate-50/50 border-slate-200 text-slate-600'}`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-100'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-slate-800">{opt.title}</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-light">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: BACKUP API ENDPOINT */}
              <AnimatePresence>
                {(extractionMode === 'backup_api' || extractionMode === 'hybrid_fallback') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 border-t border-slate-100 pt-4"
                  >
                    <label className="block text-xs font-bold text-slate-600">آدرس سرور پشتیبان مستقل (REST Proxy JSON):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={localBackupUrl}
                        onChange={(e) => setLocalBackupUrl(e.target.value)}
                        onBlur={handleBackupUrlBlur}
                        placeholder="https://youtube-transcript.io/"
                        className="flex-1 font-mono text-xs px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLocalBackupUrl('https://youtube-transcript.io/');
                          onBackupApiUrlChange('https://youtube-transcript.io/');
                        }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-[10px] font-bold text-slate-700 transition-colors"
                      >
                        بازنشانی پیش‌فرض
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      * پلتفرم شناسه ویدیو (ID) را به صورت خودکار به انتهای این آدرس به عنوان پارامتر ارسال می‌کند. فیلد خروجی جهت بیشترین سازگاری باید به صورت آرایه‌ای از اشیا دارای خصوصیات text و offset/start ساختاردهی شده باشد.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SECTION 3: API KEY SETTINGS */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                  <Key className="w-4 h-4 text-blue-500" />
                  <h4>تنظیمات کلید API اختصاصی Gemini (دور زدن کوتای عمومی):</h4>
                </div>

                {/* Educational info on Key Leaking */}
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-right">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950">چرا خطای «افشای کلید» رخ می‌دهد؟</h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-light">
                      موتورهای گوگل همواره محیط‌های توسعه آنلاین را اسکن می‌کنند. اگر کلید مشترک پلتفرم در معرض دید قرار گیرد، گوگل فورا آن را باطل می‌کند. با معرفی کلید اختصاصی خود، پایداری تام فرآیند تحلیل را به رایگان تضمین کنید.
                    </p>
                  </div>
                </div>

                {/* Password-like input field */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy... برای استفاده از منابع بستر اشتراکی خالی بگذارید"
                      className="w-full font-mono text-sm pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-left"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick links */}
                <div className="flex justify-between items-center text-xs">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    دریافت کلید API جدید بصورت کاملاً رایگان از Google AI Studio
                  </a>
                </div>

                {/* Test diagnostics status */}
                <AnimatePresence>
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex gap-3 text-right max-w-full text-xs ${testResult.success ? 'bg-emerald-50 text-emerald-950 border border-emerald-100' : 'bg-red-50 text-red-950 border border-red-100'}`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <span className="font-semibold leading-relaxed">{testResult.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions group */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing || !apiKey.trim()}
                    className="flex-1 min-w-[120px] py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {testing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {testing ? 'در حال آزمایش...' : 'تست اعتبار کلید'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!apiKey.trim()}
                    className="flex-1 min-w-[120px] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    ذخیره و فعال‌سازی روی مرورگر
                  </button>

                  {savedKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
                    >
                      حذف کلید و بازگشت به پیش‌فرض
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
