/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Tv, Users, Clock, Tag, ExternalLink } from 'lucide-react';
import type { VideoDetails } from '../types';

interface VideoDetailsCardProps {
  details: VideoDetails;
  url: string;
}

export default function VideoDetailsCard({ details, url }: VideoDetailsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-blue-500 to-red-500" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-2">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Tv className="w-5 h-5 text-blue-500" />
          مشخصات و جزئیات ویدیو
        </h3>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-full border border-slate-100 transition-all"
        >
          مشاهده در یوتیوب
          <ExternalLink className="w-3.5 h-3.5 transform rotate-180" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Source Channel  */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">نام کانال / منبع</span>
            <span className="text-sm font-semibold text-slate-700">{details.channelName}</span>
          </div>
        </div>

        {/* Speakers / Narrations */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">گویندگان / کارشناسان</span>
            <div className="flex flex-wrap gap-1">
              {details.speakers?.length > 0 ? (
                details.speakers.map((speaker, idx) => (
                  <span key={idx} className="text-sm font-semibold text-slate-700 block">
                    {speaker}{idx < details.speakers.length - 1 ? '، ' : ''}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 font-medium">نامشخص</span>
              )}
            </div>
          </div>
        </div>

        {/* Duration & Category */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">دسته‌بندی و مدت زمان</span>
            <span className="text-sm font-semibold text-slate-700 block">
              {details.category} • {details.duration} دقیقه
            </span>
          </div>
        </div>
      </div>

      {details.tagsAndKeywords && details.tagsAndKeywords.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 ml-2">
            <Tag className="w-3.5 h-3.5" />
            کلیدواژه‌ها:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {details.tagsAndKeywords.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200/60 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
