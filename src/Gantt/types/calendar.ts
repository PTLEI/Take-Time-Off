export type DatePeriod = 'week' | 'month';

export type IntervalItemType = {
  startTime: number;
  endTime: number;
  dateText: string;
  isToday: boolean;
  extraClassName: string;
};
