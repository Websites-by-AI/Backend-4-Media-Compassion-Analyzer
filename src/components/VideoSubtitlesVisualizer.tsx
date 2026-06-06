/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Palette, Check, Download, 
  Sparkles, AlertCircle, Edit3, Layers, Eye, EyeOff
} from 'lucide-react';

interface SubtitleSegment {
  id: number;
  timeStart: string;
  timeEnd: string;
  secondsStart: number;
  secondsEnd: number;
  text: string;
  speaker: string;
  speakerColor: string;
  sentiment: string;
  sentimentColor: string;
  compassionScore: number;
}

interface VideoSubtitlesVisualizerProps {
  transcript: string;
  videoDetails?: {
    channelName: string;
    speakers: string[];
    category: string;
  };
}

// Visual themes representing different frame captures/scenes of the video
const SCENE_THEMES = [
  {
    id: 1,
    title: "صحنه اول: تریبون سیاسی مستقل",
    timeLabel: "شروع ویدیو",
    desc: "نمای عریض از کادر استودیو، نورپردازی تیره و مدرن",
    bgClass: "bg-radial from-slate-900 via-zinc-950 to-black",
    overlaySvg: (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeDasharray="10 15" />
      </svg>
    ),
    speakerSilhouette: "🎙️ سخنگو"
  },
  {
    id: 2,
    title: "صحنه دوم: نقد قوه قضائیه و موازنه خیابان",
    timeLabel: "دقیقه ۰۴:۱۵",
    desc: "کادر با کنتراست شدید، جزئیات متشنج و هاله‌های مخملی سرخ",
    bgClass: "bg-radial from-rose-950/40 via-neutral-950 to-slate-950",
    overlaySvg: (
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 150 L400 150 M250 100 L250 300" stroke="rgba(239,68,68,0.3)" strokeWidth="3" />
        <circle cx="250" cy="150" r="40" fill="none" stroke="rgba(115,115,115,0.4)" strokeWidth="2" />
        <path d="M0 450 Q250 150 500 450" fill="none" stroke="rgba(225,29,72,0.1)" strokeWidth="1.5" />
        <path d="M0 500 Q250 200 500 500" fill="none" stroke="rgba(225,29,72,0.1)" strokeWidth="1.5" />
      </svg>
    ),
    speakerSilhouette: "⚖️ تکیه بر اصول حقوقی"
  },
  {
    id: 3,
    title: "صحنه سوم: تحلیل دیپلماسی ترامپ و بن‌سلمان",
    timeLabel: "دقیقه ۰۹:۳۰",
    desc: "ساختار فنی و انتزاعی نقشه ژئوپلیتیک با خطوط طلایی و نئون",
    bgClass: "bg-radial from-amber-950/20 via-slate-950 to-neutral-950",
    overlaySvg: (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 50 L120 180 L280 120 L400 290 L480 350" fill="none" stroke="rgba(245,158,11,0.25)" strokeWidth="2" strokeDasharray="5 5" />
        <circle cx="120" cy="180" r="6" fill="#f59e0b" />
        <circle cx="280" cy="120" r="6" fill="#f59e0b" />
        <circle cx="400" cy="290" r="8" fill="#e0a82e" />
        <circle cx="480" cy="350" r="6" fill="#f59e0b" />
      </svg>
    ),
    speakerSilhouette: "🌍 روابط بین‌الملل"
  },
  {
    id: 4,
    title: "صحنه چهارم: مطالبات پرستاران و بیانیه رضا پهلوی",
    timeLabel: "دقیقه ۱۴:۱۰",
    desc: "دریای جمعیت با فیلتر منحصربه‌فرد سرد سنگی و درخشش فیروزه‌ای",
    bgClass: "bg-radial from-cyan-950/30 via-slate-950 to-black",
    overlaySvg: (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="rgba(6,182,212,0.2)" strokeWidth="1">
          <line x1="0" y1="400" x2="500" y2="400" />
          <line x1="0" y1="420" x2="500" y2="420" />
          <line x1="50" y1="380" x2="50" y2="440" />
          <line x1="250" y1="380" x2="250" y2="440" />
          <line x1="450" y1="380" x2="450" y2="440" />
        </g>
        <circle cx="250" cy="410" r="15" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.4)" strokeWidth="2" />
      </svg>
    ),
    speakerSilhouette: "👥 همبستگی مردمی"
  }
];

export default function VideoSubtitlesVisualizer({ transcript, videoDetails }: VideoSubtitlesVisualizerProps) {
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSceneId, setActiveSceneId] = useState(1);
  
  // Customization Options
  const [showMetadata, setShowMetadata] = useState(true);
  const [colorPalette, setColorPalette] = useState<'yellow' | 'cyan' | 'green' | 'white' | 'crimson'>('yellow');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [boxBgOpacity, setBoxBgOpacity] = useState<number>(0.85);
  
  // Editing active subtitle state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse lines into clean subtitle segments
  useEffect(() => {
    if (!transcript) return;

    const rawLines = transcript.split('\n');
    const parsedSegments: SubtitleSegment[] = [];
    let currentTimestamp = "";
    let currentSeconds = 0;
    
    // Auxiliary helper to convert MM:SS to seconds
    const parseTimeToSeconds = (tStr: string): number => {
      const parts = tStr.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
      return 0;
    };

    let idCounter = 1;
    
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      // Match timestamp pattern "00:00:04" or "[00:00:04]" or "00:04"
      const timeMatch = line.match(/^(?:\[)?(\d{2}:\d{2}(?::\d{2})?)(?:\])?$/) || line.match(/^\[?(\d{2}:\d{2})\]?$/);
      
      if (timeMatch) {
        currentTimestamp = timeMatch[1];
        currentSeconds = parseTimeToSeconds(currentTimestamp);
      } else {
        // This is a content/subtitle text line
        let segmentText = line;
        let speakerName = "کارشناس املاک سیاسی";
        let speakerCol = "text-indigo-400";
        let sentimentStr = "بی‌طرف و ارزیابی عقلانی";
        let sentimentCol = "text-slate-400";
        let compassionValue = 50;

        // Extract speaker tags if any, e.g. "[موسیقی]" or "[Name]:"
        const bracketMatch = segmentText.match(/^\[(.*?)\]\s*(.*)/);
        if (bracketMatch) {
          const tag = bracketMatch[1];
          if (["موسیقی", "موزیک", "صدا", "خنده"].includes(tag)) {
            speakerName = "افکت صوتی محیطی";
            speakerCol = "text-slate-500";
            sentimentStr = "فضاسازی و ترانزیشن";
            sentimentCol = "text-slate-400";
            compassionValue = 30;
          } else {
            speakerName = tag;
            segmentText = bracketMatch[2] || segmentText;
          }
        }

        // Apply contextual intelligence depending on contents to generate vivid Farsi tags
        const textLower = segmentText.toLowerCase();
        if (textLower.includes("شاهزاده") || textLower.includes("پهلوی") || textLower.includes("رضا")) {
          speakerName = "شاهزاده رضا پهلوی";
          speakerCol = "text-blue-400";
          sentimentStr = "مطالبه‌گرانه / موازنه ملی";
          sentimentCol = "text-cyan-400";
          compassionValue = 85;
        } else if (textLower.includes("اعدام") || textLower.includes("قاضی") || textLower.includes("اژه") || textLower.includes("کشتار")) {
          speakerName = "تحلیل‌گر رسانه‌ای";
          speakerCol = "text-purple-400";
          sentimentStr = "احساسی بالا / نقد حقوق بشر";
          sentimentCol = "text-rose-500 font-bold";
          compassionValue = 90;
        } else if (textLower.includes("ترامپ") || textLower.includes("بن سلمان") || textLower.includes("مذاکره")) {
          speakerName = "تحلیل‌گر استراتژیک";
          speakerCol = "text-amber-400";
          sentimentStr = "ژئوپولیتیک / نقد موازنه قوا";
          sentimentCol = "text-amber-400";
          compassionValue = 40;
        } else if (textLower.includes("پرستار") || textLower.includes("مردم") || textLower.includes("تجمع")) {
          speakerName = "گزارش صدای کف جامعه";
          speakerCol = "text-emerald-400";
          sentimentStr = "همبستگی مدنی / عدالت اجتماعی";
          sentimentCol = "text-emerald-400";
          compassionValue = 95;
        }

        // Clean text formatting
        segmentText = segmentText.replace(/^\d+:\d+:\d+\s*/, '').replace(/^\d{2}:\d{2}\s*/, '');

        parsedSegments.push({
          id: idCounter++,
          timeStart: currentTimestamp || "00:00",
          timeEnd: "", // Filled after parsing all
          secondsStart: currentSeconds,
          secondsEnd: 0, // Filled in secondary pass
          text: segmentText,
          speaker: speakerName,
          speakerColor: speakerCol,
          sentiment: sentimentStr,
          sentimentColor: sentimentCol,
          compassionScore: compassionValue
        });
      }
    }

    // Secondary pass to determine timeEnd and secondsEnd
    for (let j = 0; j < parsedSegments.length; j++) {
      const current = parsedSegments[j];
      const next = parsedSegments[j + 1];
      
      if (next) {
        current.secondsEnd = next.secondsStart;
        current.timeEnd = next.timeStart;
      } else {
        current.secondsEnd = current.secondsStart + 5; // Default 5 seconds duration for last segment
        
        const endSecs = current.secondsEnd;
        const endMins = Math.floor(endSecs / 60);
        const endRemainingSecs = endSecs % 60;
        current.timeEnd = `${endMins.toString().padStart(2, '0')}:${endRemainingSecs.toString().padStart(2, '0')}`;
      }
    }

    // Default sample if no segments successfully parsed
    if (parsedSegments.length === 0) {
      parsedSegments.push({
        id: 1,
        timeStart: "00:00",
        timeEnd: "00:05",
        secondsStart: 0,
        secondsEnd: 5,
        text: "هم‌اکنون شبیه‌ساز ویدیویی زیرنویس برای این بخش فعال شده است.",
        speaker: "سیستم راهنمای خودکار",
        speakerColor: "text-indigo-400",
        sentiment: "خنثی",
        sentimentColor: "text-slate-400",
        compassionScore: 50
      });
    }

    setSegments(parsedSegments);
    setCurrentIndex(0);
  }, [transcript]);

  // Synchronize Scene Background with current segment percentage/time
  useEffect(() => {
    if (segments.length === 0) return;
    const currentPercent = (currentIndex / segments.length) * 100;
    
    // Distribute physical scenes based on timeline position evenly
    if (currentPercent < 25) {
      setActiveSceneId(1);
    } else if (currentPercent < 55) {
      setActiveSceneId(2);
    } else if (currentPercent < 80) {
      setActiveSceneId(3);
    } else {
      setActiveSceneId(4);
    }
  }, [currentIndex, segments.length]);

  // Handle Playback Loop
  useEffect(() => {
    if (isPlaying && segments.length > 0) {
      const delay = (segments[currentIndex] ? Math.max(2, segments[currentIndex].secondsEnd - segments[currentIndex].secondsStart) : 4) * 1000 / playbackSpeed;
      
      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev >= segments.length - 1) {
            setIsPlaying(false);
            return 0; // Loop or stop
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, currentIndex, segments, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  // Skip manually directly to scene timings
  const handleSceneJump = (sceneId: number) => {
    if (segments.length === 0) return;
    const targetIdx = sceneId === 1 ? 0 :
                      sceneId === 2 ? Math.floor(segments.length * 0.3) :
                      sceneId === 3 ? Math.floor(segments.length * 0.6) :
                      Math.floor(segments.length * 0.85);

    setCurrentIndex(Math.min(targetIdx, segments.length - 1));
    setActiveSceneId(sceneId);
  };

  // Retrieve current active segment safely
  const activeSegment = segments[currentIndex] || {
    id: 0,
    timeStart: "00:00",
    timeEnd: "00:00",
    text: "بدون محتوا",
    speaker: "در حال پردازش",
    speakerColor: "text-slate-400",
    sentiment: "نامعلوم",
    sentimentColor: "text-slate-400",
    compassionScore: 50
  };

  // Initialize edit field
  useEffect(() => {
    if (activeSegment) {
      setEditedText(activeSegment.text);
    }
  }, [currentIndex, isEditing, activeSegment.text]);

  const saveEditedText = () => {
    const updated = [...segments];
    if (updated[currentIndex]) {
      updated[currentIndex].text = editedText;
      setSegments(updated);
    }
    setIsEditing(false);
  };

  // Subtitle styling options
  const getSubTitleTextColors = () => {
    switch(colorPalette) {
      case 'yellow': return 'text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
      case 'cyan': return 'text-cyan-300 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
      case 'green': return 'text-emerald-400 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
      case 'crimson': return 'text-rose-400 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
      default: return 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
    }
  };

  const getSubTitleFontSize = () => {
    switch(fontSize) {
      case 'sm': return 'text-[11px] sm:text-xs';
      case 'md': return 'text-xs sm:text-sm';
      case 'xl': return 'text-lg sm:text-xl md:text-2xl font-extrabold';
      default: return 'text-sm sm:text-base md:text-lg font-bold';
    }
  };

  // Download logic for SRT with built-in styling tags supported by VLC/etc.
  const handleDownloadEnrichedSRT = () => {
    let srtContent = '';
    
    segments.forEach((seg, idx) => {
      const tStart = `00:${seg.timeStart},000`;
      const tEnd = `00:${seg.timeEnd || '00:05'},000`;
      
      // Select Color for styling tag based on palette selected
      let selectedHexColors = '#ffde59'; // default yellow
      if (colorPalette === 'cyan') selectedHexColors = '#00f0ff';
      if (colorPalette === 'green') selectedHexColors = '#00ea65';
      if (colorPalette === 'crimson') selectedHexColors = '#ff4d4d';
      if (colorPalette === 'white') selectedHexColors = '#ffffff';

      srtContent += `${idx + 1}\n`;
      srtContent += `${tStart} --> ${tEnd}\n`;
      
      if (showMetadata) {
        srtContent += `<font color="#8285f2">[${seg.speaker}]</font> <font color="#a1a1a1">[همدلی: ${seg.compassionScore}%]</font>\n`;
      }
      srtContent += `<font color="${selectedHexColors}">${seg.text}</font>\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rich-subtitles-${new Date().toISOString().split('T')[0]}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-3xl border border-slate-200 bg-slate-900 overflow-hidden shadow-2xl relative"
      dir="rtl"
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-500 via-indigo-500 to-rose-500" />

      {/* Header Info */}
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              شبیه‌ساز پخش زنده ویدیو با زیرنویس هوشمند چند رنگ
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            تلفیق هوشمند متن اصلی ویدیو با زیرنویس‌های غنی‌شده رنگی بر مبنای فرکانس همدلی رسانه‌ای و نقش‌های گفتمانی
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-indigo-200">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>پویا کالیبره شده: <strong className="text-white">{segments.length}</strong> اسلاید زیرنویس</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Large Simulated Video Viewport */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-slate-950/80 border-b lg:border-b-0 lg:border-l border-white/10 min-h-[480px]">
          
          {/* Active Scene Indicator / Visual frame options */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2.5">
              {SCENE_THEMES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneJump(scene.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                    activeSceneId === scene.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {scene.timeLabel}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
              SCENE {activeSceneId} / 4 ({SCENE_THEMES[activeSceneId - 1].title})
            </div>
          </div>

          {/* MAIN SIMULATOR VIDEO MONITOR */}
          <div className={`relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner flex flex-col justify-between p-6 transition-all duration-700 ${SCENE_THEMES[activeSceneId - 1].bgClass}`}>
            
            {/* Embedded Scene Overlay SVGs and lights */}
            {SCENE_THEMES[activeSceneId - 1].overlaySvg}
            <div className="absolute top-1/4 left-1/4 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-rose-500/15 rounded-full blur-3xl animate-pulse" />

            {/* Video Watermark & Play status overlay */}
            <div className="flex justify-between items-start z-10">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>کادر شبیه‌ساز - رسانه: {videoDetails?.channelName || "مستقل"}</span>
              </div>

              <div className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] rounded-lg border border-indigo-400/20 font-black">
                {activeSegment.timeStart}
              </div>
            </div>

            {/* Speaker Silhouette avatar helper */}
            <div className="flex justify-center items-center h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSceneId + "_" + (activeSegment?.speaker || "")}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-900/40 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/5 text-slate-400 text-xs text-center font-medium max-w-xs space-y-1"
                >
                  <p className="text-[10px] text-slate-500 tracking-wide uppercase font-bold">نمای نمادین کادر فعال</p>
                  <p className="font-extrabold text-slate-200">{SCENE_THEMES[activeSceneId - 1].speakerSilhouette}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ENRICHED SUBTITLES LAYER OVER VIDEO */}
            <div className="w-full max-w-2xl mx-auto z-10 select-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSegment.id + "_" + activeSegment.text.length}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: `rgba(0, 0, 0, ${boxBgOpacity})` }}
                  className="rounded-xl border border-white/10 px-4 py-3 sm:px-6 sm:py-4 shadow-2xl flex flex-col items-center gap-2 relative overflow-hidden"
                >
                  {/* Subtle dynamic border based on sentiment compass level */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-cyan-400 to-indigo-500" />
                  
                  {/* Subtitle Metadata Overlay */}
                  {showMetadata && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pb-1.5 border-b border-white/5 w-full text-[10px]">
                      
                      {/* Speaker Badge */}
                      <span className={`px-2 py-0.5 bg-white/5 rounded-md ${activeSegment.speakerColor} font-black`}>
                        👤 {activeSegment.speaker}
                      </span>

                      {/* Emotion Indicator */}
                      <span className={`px-2 py-0.5 bg-white/5 rounded-md ${activeSegment.sentimentColor}`}>
                        💬 {activeSegment.sentiment}
                      </span>

                      {/* Compassion Index Tag */}
                      <span className="px-2 py-0.5 bg-white/5 rounded-md text-slate-300 font-mono font-bold">
                        همدلی: <strong className="text-cyan-400">{activeSegment.compassionScore}%</strong>
                      </span>

                    </div>
                  )}

                  {/* Main Subtitle Text */}
                  {isEditing ? (
                    <div className="w-full flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="flex-1 bg-slate-800 text-white rounded px-3 py-1 text-sm text-right border border-cyan-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={saveEditedText}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs flex items-center gap-1 font-bold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        ثبت دمو
                      </button>
                    </div>
                  ) : (
                    <p className={`text-center leading-relaxed tracking-wide ${getSubTitleTextColors()} ${getSubTitleFontSize()}`}>
                      {activeSegment.text}
                    </p>
                  )}
                  
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>

          {/* PLAYER PROGRESS SCRUBBER AND CONTROLS */}
          <div className="mt-4 space-y-3 bg-slate-950 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono font-bold">{activeSegment.timeStart}</span>
              
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
                <div 
                  className="h-full bg-linear-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${segments.length > 0 ? ((currentIndex + 1) / segments.length) * 100 : 0}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-400 font-mono font-bold">
                {segments[segments.length - 1]?.timeEnd || "00:00"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Central Player Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                  }`}
                  title={isPlaying ? "توقف پخش دمو" : "شروع پخش خودکار"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all border border-white/5"
                  title="بازنشانی پخش"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed Controls */}
                <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-0.5 ml-2">
                  {[1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter transition-all ${
                        playbackSpeed === speed
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Editing controls for active subtitle text */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isEditing 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  {isEditing ? "خروج از حالت ویرایش" : "اصلاح متن اسلاید جاری"}
                </button>

                {/* Single Segment Indicator */}
                <span className="text-[10px] font-bold text-slate-500">
                  اسلاید {currentIndex + 1} از {segments.length}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Customization Sidebar & Export */}
        <div className="lg:col-span-4 p-6 space-y-6 bg-slate-950/40">
          
          {/* Box 1: Customization Configurator */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              تنظیمات استایل بصری زیرنویس
            </h4>

            {/* Subtitle Mode Toggle Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">متادیتای پیشرفته</span>
                <p className="text-[10px] text-slate-400">نمایش سخنگو و شاخص همدلی</p>
              </div>
              <button 
                onClick={() => setShowMetadata(!showMetadata)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                  showMetadata 
                    ? 'bg-cyan-500 text-slate-950 font-extrabold' 
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {showMetadata ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showMetadata ? "فعال" : "غیرفعال"}
              </button>
            </div>

            {/* Colors Option */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400">پالت رنگی متن اصلی زیرنویس</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { key: 'yellow', color: 'bg-amber-400', label: "سینمایی" },
                  { key: 'cyan', color: 'bg-cyan-400', label: "آسمانی" },
                  { key: 'green', color: 'bg-emerald-400', label: "سازگار" },
                  { key: 'white', color: 'bg-white', label: "ساده" },
                  { key: 'crimson', color: 'bg-rose-500', label: "جدی" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setColorPalette(item.key as any)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[9px] transition-all font-semibold ${
                      colorPalette === item.key
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-md ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Size option */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>اندازه فونت زیرنویس</span>
                <span className="font-mono text-cyan-400 text-xs font-black uppercase">{fontSize}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['sm', 'md', 'lg', 'xl'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size as any)}
                    className={`py-1 rounded-lg text-xs font-bold transition-all uppercase ${
                      fontSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Alpha Box Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>شفافیت پس‌زمینه کادر زیرنویس</span>
                <span className="font-mono text-xs">{Math.round(boxBgOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.1"
                value={boxBgOpacity}
                onChange={(e) => setBoxBgOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Box 2: Actions Downloads and Notice */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Download className="w-4 h-4 text-cyan-400" />
              دانلود و صادرات خطوط اصلاح‌شده
            </h4>

            <p className="text-[11px] leading-relaxed text-slate-400">
              می‌توانید کدهای زیرنویس را با رنگ‌بندی‌های اعمال شده در قالب استاندارد SRT دانلود و بر روی ویدیوهای خود الصاق کنید:
            </p>

            <button
              onClick={handleDownloadEnrichedSRT}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/10"
            >
              <Download className="w-4 h-4" />
              دانلود زیرنویس پیشرفته چند رنگ (SRT)
            </button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Reassurance/Explaination box for Sandbox limitation on YouTube subtitles injection */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <h5 className="text-[11px] font-extrabold text-amber-200">شفافیت پیرامون خروجی نهایی ویدیو</h5>
            </div>
            <p className="text-[10px] leading-relaxed text-amber-300 font-medium">
              به دلیل محدودیت‌های امنیتی مرورگر (iFrame Sandbox) و ساختار اختصاصی سایت یوتیوب، امکان چسباندن دائمی (Hardcode) مستقیم به فید استریم یوتیوب بدون تنظیم پروکسی با کلید سرور مقدور نیست.
            </p>
            <p className="text-[10px] leading-relaxed text-slate-400 border-t border-white/5 pt-1.5">
              💡 پیشنهاد: فایل زیرنویس SRT پیشرفته دانلود شده را به پلیرهایی چون <strong>VLC</strong> یا <strong>PotPlayer</strong> درگ کنید تا همانند شبیه‌ساز ما با رنگ‌بندی تفکیک‌شده به شما تحویل داده شود.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
