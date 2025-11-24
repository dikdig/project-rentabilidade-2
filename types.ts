export interface FileData {
  name: string;
  type: string;
  content: string; // stringified CSV/JSON for the AI
  size: number;
}

export interface KPIMetric {
  label: string;
  value: string;
  trend?: number; // percentage change
  trendDirection?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKeys: string[];
  colors?: string[];
  description: string;
}

export interface FieldDescription {
  fieldName: string;
  sourceFile: string;
  meaning: string;
}

export interface AnalysisResult {
  summary: string;
  kpis: KPIMetric[];
  charts: ChartConfig[];
  fieldDescriptions: FieldDescription[];
  relationshipsFound: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}
