import { motion } from 'motion/react';
import { History, Clock, ChevronLeft, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export default function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
            <History className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">تاریخچه تحلیل‌های اخیر</h2>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          پاکسازی تاریخچه
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <motion.button
            key={item.url + item.timestamp}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(item.url)}
            className="flex flex-col text-right p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp).toLocaleDateString('fa-IR')}
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            
            <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-2">
              {item.title || "ویدیوی تحلیل شده"}
            </h3>
            
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-grow">
              {item.summary}
            </p>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">سطح همدلی:</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {item.compassionLevel}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
