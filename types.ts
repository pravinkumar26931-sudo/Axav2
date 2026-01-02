
export interface WorkDay {
  date: string;
  hours: number;
  shiftType?: string; // e.g., 'Day', 'Night', 'Overtime'
}

export interface CardAnalysisResult {
  month: string;
  year: number;
  workDays: WorkDay[];
  totalHours: number;
  workerName?: string;
}

export interface EarningsResult {
  totalHours: number;
  totalDays: number;
  hourlyRate: number;
  shift12hRate: number;
  estimatedEarnings: number;
}
