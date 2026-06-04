/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { Activity, Heart, Frown, Smile } from 'lucide-react';
import type { SentimentDataPoint } from '../types';

interface SentimentDistributionChartProps {
  timeline: SentimentDataPoint[];
}

export default function SentimentDistributionChart({ timeline }: SentimentDistributionChartProps) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  // Format the data to make sure values are safe and we have a rich visualization
  const chartData = timeline.map(point => ({
    ...point,
    // Ensure value is bounded between -100 and 100 for proper graph scaling
    sentimentValue: Math.max(-100, Math.min(100, point.sentimentValue))
  }));

  // Custom tooltips to present details in clean Farsi layout
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SentimentDataPoint;
      const val = data.sentimentValue;
      
      let statusColor = "text-purple-600";
      let statusText = "خنثی / متعادل";
      
      if (val > 40) {
        statusColor = "text-emerald-600";
        statusText = "بسیار مثبت و همدلانه";
      } else if (val > 0) {
        statusColor = "text-blue-500";
        statusText = "ملایم و خوش‌بینانه";
      } else if (val < -40) {
        statusColor = "text-rose-600";
        statusText = "بسیار مهیج یا انتقادی";
      } else if (val < 0) {
        statusColor = "text-amber-500";
        statusText = "جدی یا نگران‌کننده";
      }

      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-xl max-w-xs" dir="rtl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{data.time}</span>
            <span className={`text-xs font-bold ${statusColor}`}>{statusText}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1 leading-relaxed">{data.label}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>شاخص همدلی و احساسات:</span>
            <span className="font-mono font-bold text-slate-700">{val > 0 ? `+${val}` : val}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
            نمودار توزیع لحن و نوسان احساسی ویدیو
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تحلیلی دیجیتال بر فراز و فرود لحن مهربانی، همدلی یا نقدهای جدی در طول زمان‌بندی ویدیو
          </p>
        </div>

        {/* Legend / Status badges */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Smile className="w-4 h-4 text-emerald-500" />
            <span>همدلانه و مهربان (+۱۰۰)</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Frown className="w-4 h-4 text-rose-400" />
            <span>جدی و انتقادی (-۱۰۰)</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sentimentColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={11} 
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              fontWeight="bold"
              domain={[-100, 100]} 
              tickCount={5}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
            
            {/* Smooth area showing overall trend */}
            <Area 
              type="monotone" 
              dataKey="sentimentValue" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#sentimentColor)" 
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-semibold" dir="rtl">
        <span className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-red-400" />
          تاکید بر ترویج گفت‌وگوی سازنده و کاهش سوگیری‌های رسانه‌ای
        </span>
        <span>منبع داده: موتور تحلیلی هوشمند هوش‌مصنوعی</span>
      </div>
    </motion.div>
  );
}
