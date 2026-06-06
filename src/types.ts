/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoDetails {
  channelName: string;
  speakers: string[];
  duration: string;
  category: string;
  tagsAndKeywords: string[];
}

export interface AnalysisData {
  compassionLevel: string;
  tone: string;
  bias: string;
  summary: string;
  keyClaims: string[];
}

export interface SentimentDataPoint {
  time: string;
  sentimentValue: number; // e.g. -100 to +100
  label: string; // Farsi descriptive label/mood
}

export interface AnalyzeResponse {
  transcript: string;
  analysis: AnalysisData;
  videoDetails?: VideoDetails;
  sentimentTimeline?: SentimentDataPoint[];
  usingMockData?: boolean;
  missingApiKey?: boolean;
  quotaExceeded?: boolean;
  errorOccurred?: boolean;
  realTranscriptFetched?: boolean;
  authError?: boolean;
  transcriptDisabled?: boolean;
  isSimulated?: boolean;
  modelError?: boolean;
  backupApiUsed?: boolean;
  manualImportUsed?: boolean;
  activeExtractionMode?: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface HistoryItem {
  url: string;
  timestamp: string;
  title: string;
  summary: string;
  compassionLevel: string;
}

