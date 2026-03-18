export type TourRunStatus = 'RUNNING' | 'PAUSED' | 'FINISHED';

export interface TourRun {
  id: string;
  tourName: string;
  operatorName: string;
  status: TourRunStatus;
  startedAt: Date;
  vehicle?: string;
  guideName?: string;
}
