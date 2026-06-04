/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Scale, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';
import type { AnalysisData } from '../types';

interface AnalysisCardsProps {
  data: AnalysisData;
}

const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-red-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center mt-[-8px]">
        <span className="text-xl font-bold text-slate-800">{score}%</span>
      </div>
      <span className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
};

const BiasBar = ({ score }: { score: number }) => {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between mb-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
        <span>بدون سوگیری</span>
        <span>سوگیری شدید</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${
            score < 30 ? 'bg-green-500' : score < 60 ? 'bg-amber-500' : 'bg-red-500'
          }`}
        />
      </div>
      <div className="mt-2 text-center">
        <span className="text-sm font-bold text-slate-700">{score}% سطح سوگیری</span>
      </div>
    </div>
  );
};

export default function AnalysisCards({ data }: AnalysisCardsProps) {
  // Simple heuristic to extract/map scores from Persian text
  const getScore = (text: string, isBias = false) => {
    const num = text.match(/(\d+)/);
    if (num) return Math.min(parseInt(num[0]), 100);
    
    const t = text.toLowerCase();
    if (t.includes("بسیار بالا")) return 95;
    if (t.includes("بالا")) return 75;
    if (t.includes("متوسط")) return 50;
    if (t.includes("کم") || t.includes("ناچیز")) return 25;
    if (t.includes("بسیار کم") || t.includes("خنثی")) return 10;
    
    return isBias ? 20 : 60; // Default values
  };

  const compassionScore = getScore(data.compassionLevel);
  const biasScore = getScore(data.bias, true);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
      dir="rtl"
    >
      {/* Compassion Level with Radial Progress */}
      <motion.div variants={item} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-xl">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-semibold text-slate-900">میزان مهربانی</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreCircle score={compassionScore} label="شاخص همدلی" />
          <p className="text-slate-600 leading-relaxed text-sm font-medium text-center sm:text-right">
            {data.compassionLevel}
          </p>
        </div>
      </motion.div>

      {/* Bias Detection with Linear Progress */}
      <motion.div variants={item} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-50 rounded-xl">
            <Scale className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-slate-900">تحلیل سوگیری</h3>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm font-medium mb-2">{data.bias}</p>
        <BiasBar score={biasScore} />
      </motion.div>

      {/* Emotional Tone */}
      <motion.div variants={item} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-xl">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-semibold text-slate-900">لحن عاطفی</h3>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium">{data.tone}</p>
      </motion.div>

      {/* Key Claims */}
      <motion.div variants={item} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-semibold text-slate-900">ادعاهای کلیدی</h3>
        </div>
        <ul className="space-y-2">
          {data.keyClaims.map((claim, i) => (
            <li key={i} className="flex gap-3 text-slate-600 leading-relaxed text-sm font-medium">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
              {claim}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Summary - Full Width */}
      <motion.div variants={item} className="md:col-span-2 p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-800 rounded-xl">
            <FileText className="w-5 h-5 text-blue-300" />
          </div>
          <h3 className="font-semibold">خلاصه متوازن</h3>
        </div>
        <p className="text-slate-300 leading-relaxed font-medium">{data.summary}</p>
      </motion.div>
    </motion.div>
  );
}
