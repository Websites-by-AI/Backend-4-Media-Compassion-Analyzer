/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Download, FileJson, FileText, Loader, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import type { AnalyzeResponse } from '../types';

interface ExportActionsProps {
  data: AnalyzeResponse;
  onOpenPrintView: () => void;
}

export default function ExportActions({ data, onOpenPrintView }: ExportActionsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const exportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `تحلیل-کامل-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportTranscriptTXT = () => {
    const blob = new Blob([data.transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `متن-خام-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTranscriptJSON = () => {
    const transcriptData = {
      videoId: data.videoDetails?.channelName, // best effort ID
      timestamp: new Date().toISOString(),
      transcript: data.transcript
    };
    const dataStr = JSON.stringify(transcriptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `دیتا-متن-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const exportPDF = async () => {
    setIsExportingPDF(true);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let hasCustomFont = false;

    try {
      // Fetch Vazirmatn regular TTF font dynamically from jsDelivr CDN
      const response = await fetch("https://cdn.jsdelivr.net/npm/vazirmatn-font@0.1.5/dist/font-files/Vazirmatn-Regular.ttf");
      if (!response.ok) throw new Error("قلم وزیرمتن یافت نشد.");
      
      const arrayBuffer = await response.arrayBuffer();
      // Convert ArrayBuffer to Base64 manually
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = window.btoa(binary);

      // Register the TTF font with jsPDF Virtual File System
      doc.addFileToVFS("Vazirmatn-Regular.ttf", base64);
      doc.addFont("Vazirmatn-Regular.ttf", "Vazirmatn", "normal");
      doc.setFont("Vazirmatn");
      hasCustomFont = true;
    } catch (err) {
      console.warn("Failed to load Vazirmatn font. Operating in Helvetica fallback mode.", err);
      doc.setFont("Helvetica");
    }

    // PDF Layout Parameters
    let currentY = 24;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = 180;
    let currentPage = 1;

    // Page overflow guardian
    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > 275) {
        doc.addPage();
        currentPage++;
        
        // Draw top accent strip on subsequent pages
        doc.setFillColor(15, 23, 42); // slate 900
        doc.rect(leftMargin, 10, contentWidth, 1.5, "F");

        // Subsequent page header
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        if (hasCustomFont) {
          doc.text("گزارش تحلیل همدلی رسانه - ادامه شرح", rightMargin, 16, { align: "right" });
          doc.text(`صفحه ${currentPage}`, leftMargin, 16, { align: "left" });
        } else {
          doc.text("Media Compassion Report - Continued", leftMargin, 16, { align: "left" });
          doc.text(`Page ${currentPage}`, rightMargin, 16, { align: "right" });
        }

        // Dividers
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.line(leftMargin, 19, rightMargin, 19);

        currentY = 26;
        doc.setFontSize(10);
      }
    };

    // Helper text wrapper with page-break safety
    const printMultilineText = (
      text: string, 
      align: "right" | "left", 
      fontSize: number, 
      color: [number, number, number], 
      lineHeight: number, 
      maxWidth: number, 
      ySpacingAfter: number
    ) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        checkPageBreak(lineHeight);
        const textX = align === "right" ? rightMargin : leftMargin;
        doc.text(line, textX, currentY, { align });
        currentY += lineHeight;
      }
      currentY += ySpacingAfter;
    };

    // Helper to draw horizontal dividers
    const drawDivider = (colorRGB = [241, 245, 249], thickness = 0.3) => {
      checkPageBreak(thickness + 5);
      doc.setDrawColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      doc.setLineWidth(thickness);
      doc.line(leftMargin, currentY, rightMargin, currentY);
      currentY += 6;
    };

    // START REPORT GENERATION
    // Top banner accent line
    doc.setFillColor(15, 23, 42); // Deep slate 900
    doc.rect(leftMargin, 10, contentWidth, 3, "F");

    // Title Block
    if (hasCustomFont) {
      // Primary Hebrew/Arabic/Farsi typography
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("گزارش جامع سنجش همدلی و سوگیری رسانه", rightMargin, currentY, { align: "right" });
      currentY += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`بررسی عینی محتوا با پشتیبانی هوش مصنوعی جاویدان Gemini • تاریخ ثبت گزارش: ${new Date().toLocaleDateString('fa-IR')}`, rightMargin, currentY, { align: "right" });
      currentY += 12;
    } else {
      // Roman typography fallback
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Media Compassion & Bias Analysis", leftMargin, currentY, { align: "left" });
      currentY += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`A objective assessment powered by Google Gemini • Date: ${new Date().toLocaleDateString()}`, leftMargin, currentY, { align: "left" });
      currentY += 12;
    }

    // SECTION 1: VIDEO METADATA CARD
    checkPageBreak(40);
    // Draw box background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.roundedRect(leftMargin, currentY, contentWidth, 34, 4, 4, "FD");

    const innerYStart = currentY + 7;
    doc.setFontSize(9.5);
    
    if (hasCustomFont) {
      doc.setTextColor(71, 85, 105); // slate-600
      
      // Column A (Right Column - aligned and wrapped)
      doc.text(`نام منبع / کانال:  ${data.videoDetails?.channelName || "ناشمار/نامشخص"}`, rightMargin - 6, innerYStart, { align: "right" });
      doc.text(`دسته‌بندی موضوعی:  ${data.videoDetails?.category || "تحلیلی موضوعی"}`, rightMargin - 6, innerYStart + 8, { align: "right" });
      doc.text(`کلیدواژه‌ها:  ${data.videoDetails?.tagsAndKeywords?.slice(0, 4).join(' ، ') || "ندارد"}`, rightMargin - 6, innerYStart + 16, { align: "right" });
      
      // Column B (Left Column)
      doc.text(`مدت زمان ویدیو:  ${data.videoDetails?.duration || "نامعلوم"}`, leftMargin + 6, innerYStart, { align: "left" });
      doc.text(`امضای دیجیتال:  خروجی تصدیق‌شده سند`, leftMargin + 6, innerYStart + 8, { align: "left" });
      doc.text(`منبع زیرنویس:  ${data.manualImportUsed ? "بارگذاری دستی" : data.backupApiUsed ? "سرور فرعی" : "استخراج مستقیم"}`, leftMargin + 6, innerYStart + 16, { align: "left" });
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(`Source Name: ${data.videoDetails?.channelName || "Unknown Channel"}`, leftMargin + 6, innerYStart, { align: "left" });
      doc.text(`Category: ${data.videoDetails?.category || "General Content"}`, leftMargin + 6, innerYStart + 8, { align: "left" });
      doc.text(`Duration: ${data.videoDetails?.duration || "N/A"}`, leftMargin + 6, innerYStart + 16, { align: "left" });

      doc.text(`Extraction Type: ${data.manualImportUsed ? "Manual" : "System Scraper"}`, rightMargin - 6, innerYStart, { align: "right" });
      doc.text(`Verification Signature: Certified Applet`, rightMargin - 6, innerYStart + 8, { align: "right" });
    }
    currentY += 42;

    // SECTION 2: BENTO GAUGES / INDICATORS
    checkPageBreak(35);
    
    // Left Box: Compassion Metric
    doc.setFillColor(254, 242, 242); // red-50
    doc.roundedRect(leftMargin, currentY, 86, 30, 3, 3, "F");
    if (hasCustomFont) {
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27); // red-800
      doc.text("شاخص همدلی و مهربانی (Compassion Index)", leftMargin + 80, currentY + 7, { align: "right" });
      
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // slate-700
      const compassionLines = doc.splitTextToSize(data.analysis.compassionLevel, 78);
      let compY = currentY + 14;
      for (const cline of compassionLines) {
        doc.text(cline, leftMargin + 80, compY, { align: "right" });
        compY += 5;
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27);
      doc.text("Compassion Index", leftMargin + 6, currentY + 7, { align: "left" });
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(data.analysis.compassionLevel, leftMargin + 6, currentY + 15, { align: "left" });
    }

    // Right Box: Bias Metric
    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(leftMargin + 94, currentY, 86, 30, 3, 3, "F");
    if (hasCustomFont) {
      doc.setFontSize(10);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text("تحلیل سوگیری محتوا (Bias Assessment)", leftMargin + 94 + 80, currentY + 7, { align: "right" });
      
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const biasLines = doc.splitTextToSize(data.analysis.bias, 78);
      let biasY = currentY + 14;
      for (const bline of biasLines) {
        doc.text(bline, leftMargin + 94 + 80, biasY, { align: "right" });
        biasY += 5;
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(146, 64, 14);
      doc.text("Bias Assessment", leftMargin + 94 + 6, currentY + 7, { align: "left" });
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(data.analysis.bias, leftMargin + 94 + 6, currentY + 15, { align: "left" });
    }
    currentY += 36;

    // SECTION 3: EMOTIONAL TONALITY
    checkPageBreak(25);
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(leftMargin, currentY, contentWidth, 20, 3, 3, "F");
    
    if (hasCustomFont) {
      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175); // blue-800
      doc.text("لحن عاطفی گفتار (Emotional Tone)", rightMargin - 6, currentY + 7, { align: "right" });
      
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(data.analysis.tone, rightMargin - 6, currentY + 14, { align: "right" });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175);
      doc.text("Emotional Tone Keynote", leftMargin + 6, currentY + 7, { align: "left" });
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(data.analysis.tone, leftMargin + 6, currentY + 14, { align: "left" });
    }
    currentY += 26;

    // SECTION 4: BALANCED SUMMARY
    checkPageBreak(15);
    drawDivider();

    if (hasCustomFont) {
      printMultilineText("۱. خلاصه تحلیلی و متوازن صحنه", "right", 12, [15, 23, 42], 7, contentWidth, 3);
      printMultilineText(data.analysis.summary, "right", 9.5, [51, 65, 85], 5.5, contentWidth, 8);
    } else {
      printMultilineText("1. Balanced Content Summary", "left", 12, [15, 23, 42], 7, contentWidth, 3);
      printMultilineText(data.analysis.summary, "left", 9.5, [51, 65, 85], 5.5, contentWidth, 8);
    }

    // SECTION 5: KEY CLAIMS
    checkPageBreak(15);
    drawDivider();

    if (hasCustomFont) {
      printMultilineText("۲. ادعاها، استدلال‌ها و اظهارات محوری", "right", 12, [15, 23, 42], 7, contentWidth, 4);
      
      data.analysis.keyClaims.forEach((claim) => {
        checkPageBreak(12);
        doc.setFillColor(34, 197, 94); // emerald bg for bullet
        doc.circle(rightMargin - 2, currentY - 1, 1, "F");
        printMultilineText(claim, "right", 9.5, [51, 65, 85], 5.5, contentWidth - 6, 2);
      });
      currentY += 4;
    } else {
      printMultilineText("2. Key Claims & Primary Arguments", "left", 12, [15, 23, 42], 7, contentWidth, 4);
      
      data.analysis.keyClaims.forEach((claim) => {
        checkPageBreak(12);
        doc.setFillColor(34, 197, 94);
        doc.circle(leftMargin + 2, currentY - 1, 1, "F");
        printMultilineText(claim, "left", 9.5, [51, 65, 85], 5.5, contentWidth - 6, 2);
      });
      currentY += 4;
    }

    // SECTION 6: SENTIMENT TIMELINE (IF AVAILABLE)
    if (data.sentimentTimeline && data.sentimentTimeline.length > 0) {
      checkPageBreak(25);
      drawDivider();
      
      if (hasCustomFont) {
        printMultilineText("۳. خط سیر احساسی و نوسان لحن ویدیو (تایم‌لاین)", "right", 12, [15, 23, 42], 7, contentWidth, 5);
        
        // Define a grid layout for timeline
        // Table Head
        checkPageBreak(10);
        doc.setFillColor(241, 245, 249);
        doc.rect(leftMargin, currentY - 4, contentWidth, 7, "F");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("زمان رخ‌داد", leftMargin + 10, currentY, { align: "left" });
        doc.text("شاخص نوسان عاطفی (-۱۰۰ تا +۱۰۰)", leftMargin + 80, currentY, { align: "center" });
        doc.text("برچسب لحن عاطفی", rightMargin - 10, currentY, { align: "right" });
        currentY += 7;

        data.sentimentTimeline.forEach((point) => {
          checkPageBreak(10);
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          
          // Time
          doc.text(point.time, leftMargin + 10, currentY, { align: "left" });
          
          // Graph bar simulation
          const barWidth = 30;
          const centerline = leftMargin + 80;
          const offsetBar = (point.sentimentValue / 100) * (barWidth / 2);
          
          // Neutral axis line
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.3);
          doc.line(centerline - (barWidth/2), currentY - 1, centerline + (barWidth/2), currentY - 1);
          
          // Value line fill
          if (point.sentimentValue > 0) {
            doc.setFillColor(34, 197, 94); // positive sentiment - emerald
            doc.rect(centerline, currentY - 2.5, offsetBar, 3, "F");
          } else {
            doc.setFillColor(239, 68, 68); // negative sentiment - red
            doc.rect(centerline + offsetBar, currentY - 2.5, Math.abs(offsetBar), 3, "F");
          }
          
          // Label
          doc.text(point.label, rightMargin - 10, currentY, { align: "right" });
          
          currentY += 8;
        });
      } else {
        printMultilineText("3. Emotional Sentiment Timeline", "left", 12, [15, 23, 42], 7, contentWidth, 5);
        
        checkPageBreak(10);
        doc.setFillColor(241, 245, 249);
        doc.rect(leftMargin, currentY - 4, contentWidth, 7, "F");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("Timestamp", leftMargin + 10, currentY, { align: "left" });
        doc.text("Sentiment Value (-100 to +100)", leftMargin + 80, currentY, { align: "center" });
        doc.text("Tone Tag", rightMargin - 10, currentY, { align: "right" });
        currentY += 7;

        data.sentimentTimeline.forEach((point) => {
          checkPageBreak(10);
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          
          doc.text(point.time, leftMargin + 10, currentY, { align: "left" });
          
          // draw visual bar
          const barWidth = 30;
          const centerline = leftMargin + 80;
          const offsetBar = (point.sentimentValue / 100) * (barWidth / 2);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.3);
          doc.line(centerline - (barWidth/2), currentY - 1, centerline + (barWidth/2), currentY - 1);
          
          if (point.sentimentValue > 0) {
            doc.setFillColor(34, 197, 94);
            doc.rect(centerline, currentY - 2.5, offsetBar, 3, "F");
          } else {
            doc.setFillColor(239, 68, 68);
            doc.rect(centerline + offsetBar, currentY - 2.5, Math.abs(offsetBar), 3, "F");
          }
          
          doc.text(point.label, rightMargin - 10, currentY, { align: "right" });
          currentY += 8;
        });
      }
    }

    // FINAL FOOTER (DRAW PAGE MARKER ON CURRENT PAGE)
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.line(leftMargin, 281, rightMargin, 281);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    if (hasCustomFont) {
      doc.text("این تحلیل به منزله تایید نهایی نیست و مسئولیت بررسی دقیق داده‌ها بر عهده کاربر است.", rightMargin, 286, { align: "right" });
      doc.text(`صفحه ${currentPage} از ${currentPage}`, leftMargin, 286, { align: "left" });
    } else {
      doc.text("Automated PDF export. Certified using our Media Compassion validation guidelines.", leftMargin, 286, { align: "left" });
      doc.text(`Page ${currentPage} of ${currentPage}`, rightMargin, 286, { align: "right" });
    }

    // Save final document
    const finalFilename = `گزارش-تحلیل-همدلی-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(finalFilename);
    setIsExportingPDF(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8 pt-8 border-t border-slate-200" dir="rtl">
      <span className="text-sm font-medium text-slate-500 ml-4 flex items-center gap-2">
        <Download className="w-4 h-4" /> خروجی تحلیل
      </span>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
      >
        <FileJson className="w-4 h-4 text-amber-500" />
        JSON گزارش
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportTranscriptTXT}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
      >
        <FileText className="w-4 h-4 text-blue-400" />
        متن خام (TXT)
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportTranscriptJSON}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
      >
        <FileJson className="w-4 h-4 text-purple-500" />
        دیتا متن (JSON)
      </motion.button>

      <motion.button
        whileHover={!isExportingPDF ? { scale: 1.02 } : {}}
        whileTap={!isExportingPDF ? { scale: 0.98 } : {}}
        onClick={exportPDF}
        disabled={isExportingPDF}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer ${
          isExportingPDF 
            ? "bg-slate-50/80 border-slate-200 text-slate-400 cursor-wait" 
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        {isExportingPDF ? (
          <Loader className="w-4 h-4 text-red-500 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 text-red-500" />
        )}
        {isExportingPDF ? "در حال تولید فایل PDF..." : "PDF گزارش"}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenPrintView}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
      >
        <Printer className="w-4 h-4 text-emerald-600 animate-pulse" />
        نسخه چاپی (پرینت/PDF)
      </motion.button>
    </div>
  );
}
