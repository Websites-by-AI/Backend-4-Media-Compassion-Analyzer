import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Lightbulb, ShieldCheck, Zap } from 'lucide-react';

const TIPS = [
  {
    icon: <Brain className="w-5 h-5 text-blue-500" />,
    text: "هوش مصنوعی در حال تحلیل لایه‌های پنهان کلام و استخراج لحن (Tone) ویدیو است."
  },
  {
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    text: "آیا می‌دانید؟ زبان همدلانه می‌تواند مقاومت ذهنی مخاطب را تا ۴۰٪ کاهش دهد."
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    text: "ما در حال بررسی بیش از ۵۰ فاکتور روان‌شناختی در متن ویدیو هستیم."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    text: "بررسی سوگیری‌های رسانه‌ای به شما کمک می‌کند تا اخبار را هوشمندانه‌تر فیلتر کنید."
  },
  {
    icon: <Zap className="w-5 h-5 text-purple-500" />,
    text: "نکته: برخی ویدیوها زیرنویس ندارند. در این حالت ما از تحلیل زمینه (Contextual Analysis) استفاده می‌کنیم."
  },
  {
    icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
    text: "کمی دیگر صبر کنید؛ داده‌ها در حال تبدیل به نمودارهای تحلیل احساسات هستند."
  }
];

export default function LoadingIndicator() {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (100 - prev) * 0.05;
      });
    }, 500);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mt-12 w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>

        <div className="relative space-y-8 text-center">
          {/* Main Loader */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-300">
              <motion.div
                animate={{ 
                  rotate: 360,
                  borderRadius: ["24px", "40px", "24px"]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-10 h-10 border-4 border-white/30 border-t-white rounded-xl"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">در حال پردازش هوشمند</h3>
            <p className="text-slate-500 font-medium">لطفاً چند لحظه منتظر بمانید...</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <motion.div 
                className="h-full bg-gradient-to-l from-blue-600 to-indigo-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>در حال استخراج...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Tips Carousel */}
          <div className="pt-4 border-t border-slate-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right"
              >
                <div className="shrink-0 p-2 bg-white rounded-xl shadow-sm">
                  {TIPS[tipIndex].icon}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {TIPS[tipIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
