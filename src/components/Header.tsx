/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Heart, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="py-8 text-center" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 mb-4"
      >
        <div className="p-3 bg-red-50 rounded-2xl">
          <Heart className="w-8 h-8 text-red-500 fill-red-500/10" />
        </div>
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Compass className="w-8 h-8 text-blue-500" />
        </div>
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
      >
        تحلیل‌گر مهربانی رسانه
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto px-4 leading-relaxed"
      >
        تحلیل ویدیوهای یوتیوب از نظر همدلی، لحن عاطفی و سوگیری‌های ایدئولوژیک با استفاده از هوش مصنوعی پیشرفته.
      </motion.p>
    </header>
  );
}
