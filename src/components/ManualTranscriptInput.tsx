import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle, 
  X, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ManualTranscriptInputProps {
  manualTranscript: string;
  onTranscriptChange: (text: string) => void;
}

export default function ManualTranscriptInput({
  manualTranscript,
  onTranscriptChange
}: ManualTranscriptInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (text: string) => {
    onTranscriptChange(text);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".srt") || file.name.endsWith(".json") || file.name.endsWith(".vtt"))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          handleTextChange(text);
          setIsExpanded(true);
        }
      };
      reader.readAsText(file);
    } else {
      alert("لطفاً یک فایل متنی معتبر (مانند txt. یا srt.) بارگذاری کنید.");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearTranscript = () => {
    handleTextChange("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm mt-4 overflow-hidden">
      {/* Accordion Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-right"
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl transition-colors ${manualTranscript ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">بارگذاری دستی متن یا زیرنویس ویدیو (پشتیبان هوشمند)</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              در صورت نبود زیرنویس خودکار یا جهت استفاده از ابزارهای خارجی مانند NoteGPT
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {manualTranscript ? (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              متن آماده تحلیل ({manualTranscript.split(/\s+/).length} کلمه)
            </span>
          ) : (
            <span className="text-xs text-slate-400">تنظیم دستی</span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/20"
          >
            <div className="p-6 space-y-6">
              
              {/* NoteGPT Guide Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4>راهنمای گام‌به‌گام دریافت زیرنویس از NoteGPT:</h4>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed font-light">
                  اگر ویدیوی مورد نظر شما فاقد زیرنویس در یوتیوب است یا به طور مستقیم فراخوانی نمی‌شود:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600 list-decimal pl-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-blue-600">۱. استفاده از ابزار رایگان:</span>
                    <p className="font-light">
                      ابتدا وارد وب‌سایت <a href="https://notegpt.io/youtube-transcript-generator" target="_blank" rel="noreferrer" className="text-blue-600 font-medium inline-flex items-center gap-0.5 hover:underline">NoteGPT Transcript Generator <ExternalLink className="w-2.5 h-2.5" /></a> شوید.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-blue-600">۲. استخراج رایگان زیرنویس:</span>
                    <p className="font-light">
                      لینک ویدیوی یوتیوب را در آنجا وارد کرده و بر روی کلید <strong className="text-slate-800">Generate Transcript</strong> کلیک کنید تا متن کامل در چند ثانیه استخراج شود.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-blue-600">۳. ذخیره یا کپی متن:</span>
                    <p className="font-light">
                      متن زیرنویس تولید شده را کپی کرده یا به صورت فایل متنی (<code className="font-mono bg-slate-50 px-1 py-0.5 rounded">.txt</code>) دانلود و ذخیره نمایید.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-blue-600">۴. انتقال و تحلیل زنده:</span>
                    <p className="font-light">
                      متن کپی شده را در کادر پایین قرار دهید، آدرس ویدیو را در کادر اصلی بالای صفحه وارد کرده و کلید <strong className="text-slate-800">تحلیل ویدیو</strong> را بزنید.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone & Textarea Combo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 block">لطفاً متن زیرنویس یا رونوشت ویدیو را در کادر زیر وارد کنید یا فایل آن را آپلود نمایید:</span>
                  {manualTranscript && (
                    <button
                      type="button"
                      onClick={clearTranscript}
                      className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      پاکسازی کادر
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* TEXTAREA WRAPPPER */}
                  <div className="md:col-span-2 space-y-1.5">
                    <textarea
                      value={manualTranscript}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="رونوشت یا زیرنویس استخراج‌شده را در اینجا کلیک راست و Paste (جایگذاری) کنید یا فایل متنی را بر روی بخش روبه‌رو رها کنید..."
                      className="w-full h-44 p-4 text-xs font-light rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none resize-none leading-relaxed bg-white text-slate-700 text-right pr-4"
                      dir="rtl"
                    />
                  </div>

                  {/* DRAG AND DROP ZONE */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? "border-emerald-500 bg-emerald-50/30" 
                        : manualTranscript 
                          ? "border-emerald-300 bg-emerald-50/5 hover:bg-emerald-50/10" 
                          : "border-slate-200 bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".txt,.srt,.json,.vtt"
                      className="hidden"
                    />
                    <div className={`p-3 rounded-full mb-2 ${manualTranscript ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Upload className="w-5 h-5" />
                    </div>
                    {manualTranscript ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-800">فایل با موفقیت بارگذاری شد</span>
                        <p className="text-[10px] text-slate-400 font-light">جهت تغییر فایل، کلیک کنید یا فایل دیگری را رها کنید</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700">بارگذاری یا رها کردن فایل</span>
                        <p className="text-[10px] text-slate-400 font-light px-2 leading-normal">فایل با فرمت‌های txt، srt، vtt یا json رونوشت</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm banner */}
                <AnimatePresence>
                  {manualTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>جهت نهایی‌سازی، کافیست آدرس ویدیوی یوتیوب را در کادر بالای اصلی قرار داده و دکمه <b>تحلیل ویدیو</b> را فشار دهید.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
