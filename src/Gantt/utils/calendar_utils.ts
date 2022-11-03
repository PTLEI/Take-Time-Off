import moment from 'moment';
import { DatePeriod, IntervalItemType } from '../types/calendar';

export const DATE_PERIOD_WEEK = 'week';
export const DATE_PERIOD_MONTH = 'month';
export const DATE_PERIOD_YEAR = 'year';
export const DATE_PERIOD = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

const units: Record<string, 'w' | 'M' | 'y'> = {
  [DATE_PERIOD.WEEK]: 'w',
  [DATE_PERIOD.MONTH]: 'M',
  [DATE_PERIOD.YEAR]: 'y',
};

const ONE_DAY = 86400000; // 1 day
const CALENDAR_INTERVAL = {
  week: ONE_DAY * 7,
  month: ONE_DAY * 30,
};

export function getTimeRange(datePeriod: DatePeriod = DATE_PERIOD_WEEK, time: number) {
  const m = moment(time).startOf(datePeriod);
  const startTime = m.valueOf();
  const endTime = m.add(1, units[datePeriod]).valueOf() - 1;
  return { startTime, endTime };
}

export function getTimeRanges(
  datePeriod: DatePeriod = DATE_PERIOD_WEEK,
  startTime: number,
  endTime: number,
) {
  const ranges: { startTime: number; endTime: number }[] = [];

  const sTime = moment(startTime).startOf(datePeriod);
  while (sTime.valueOf() <= endTime) {
    const startTime = sTime.valueOf();
    sTime.add(1, units[datePeriod]);
    const endTime = sTime.valueOf() - 1;
    ranges.push({ startTime, endTime });
  }

  return ranges;
}

export function getTruncateStartTime(datePeriod: DatePeriod = DATE_PERIOD_WEEK, time = new Date()) {
  const m = moment(time);
  if (datePeriod === DATE_PERIOD.WEEK) {
    if (m.day() === 0) {
      return m.startOf('day').valueOf();
    }

    return m.startOf(datePeriod).subtract(1, 'd').valueOf();
  }

  return m.startOf(datePeriod).valueOf();
}

export function getInitVisibleDateRange(datePeriod: DatePeriod, initVisibleTimeStart: number) {
  let visibleTimeStart;
  if (datePeriod === DATE_PERIOD.WEEK) {
    // when the Period === 'week', the day of visibleTimeStart should be Sunday
    if (initVisibleTimeStart) {
      visibleTimeStart = moment(initVisibleTimeStart).startOf('day').valueOf();
    } else if (moment().day() === 0) {
      visibleTimeStart = moment().startOf('day').valueOf();
    } else {
      visibleTimeStart = moment().startOf(datePeriod).subtract(1, 'd').valueOf();
    }
  } else {
    visibleTimeStart = moment().startOf(datePeriod).valueOf();
  }
  return {
    visibleTimeStart,
    visibleTimeEnd: visibleTimeStart + CALENDAR_INTERVAL[datePeriod],
  };
}

export function getCalendarBoundariesFromVisibleTime(
  visibleTimeStart: number,
  datePeriod: DatePeriod,
) {
  // 日历的整体范围根据visibleStart当天0点向前推一个周期（月/30天， 周/7天），先后推两个周期，所以整一个范围控制在三个周期
  const start = moment(visibleTimeStart).startOf('day').valueOf();
  const calendarTimeStart = start - CALENDAR_INTERVAL[datePeriod];
  const calendarTimeEnd = start + CALENDAR_INTERVAL[datePeriod] * 2;

  return {
    calendarTimeStart,
    calendarTimeEnd,
  };
}

export function getGridNumber(datePeriod: DatePeriod) {
  if (datePeriod === DATE_PERIOD.WEEK) {
    return 7;
  } else if (datePeriod === DATE_PERIOD.MONTH) {
    return 30;
  }
  return 0;
}

export function iterateTimes(start: number, end: number, datePeriod?: DatePeriod) {
  const intervals: IntervalItemType[] = [];
  let time = moment(start).startOf('day');

  while (time.valueOf() < end) {
    const nextTime = moment(time).add(1, 'd');
    let dateFormat;
    switch (datePeriod) {
      case DATE_PERIOD.WEEK:
        dateFormat = 'DD ddd';
        break;
      case DATE_PERIOD.MONTH:
        dateFormat = 'D';
        break;
      default:
        dateFormat = 'D';
        break;
    }

    const intervalStart = time.valueOf();
    let extraClassName = '';
    let isToday = false;
    if (intervalStart === moment().startOf('day').valueOf()) {
      isToday = true;
      extraClassName = 'gannt-today';
    } else if (time.weekday() === 5 || time.weekday() === 6) {
      extraClassName = 'gannt-weekend';
    }
    if (!isToday && intervalStart === moment().subtract(1, 'd').startOf('day').valueOf()) {
      extraClassName += ' gannt-before-today';
    }

    intervals.push({
      startTime: intervalStart,
      endTime: nextTime.valueOf(),
      dateText: time.format(dateFormat),
      isToday,
      extraClassName,
    });
    time = nextTime;
  }
  return intervals;
}

export function calculateScrollCalendar({
  visibleTimeStart,
  visibleTimeEnd,
  originCalendarTimeStart,
  datePeriod,
  reachedThreshold,
}: {
  visibleTimeStart: number;
  visibleTimeEnd: number;
  originCalendarTimeStart: number;
  datePeriod: DatePeriod;
  reachedThreshold: number;
}) {
  const zoom = visibleTimeEnd - visibleTimeStart;

  const offset = zoom * reachedThreshold;
  const canKeepLastOne =
    visibleTimeStart >= originCalendarTimeStart + offset &&
    visibleTimeStart <= originCalendarTimeStart + zoom + offset &&
    visibleTimeEnd >= originCalendarTimeStart + zoom * 2 - offset &&
    visibleTimeEnd <= originCalendarTimeStart + zoom * 3 - offset;

  if (!canKeepLastOne) {
    const { calendarTimeStart, calendarTimeEnd } = getCalendarBoundariesFromVisibleTime(
      visibleTimeStart,
      datePeriod,
    );
    const intervals = iterateTimes(calendarTimeStart, calendarTimeEnd, datePeriod);

    return {
      calendarTimeStart,
      calendarTimeEnd,
      intervals,
    };
  }
  return null;
}
export function getTimeFormat(time?: number) {
  const currentYear = moment().year();
  if (time) {
    var timeYear = moment(time).year();
    if (timeYear === currentYear) {
      return moment(time).format('M.D');
    }
    return moment(time).format('YYYY.M.D');
  }
  return '';
}
