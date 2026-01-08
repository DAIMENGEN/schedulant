import dayjs, {type Dayjs} from "dayjs";
import weekYear from "dayjs/plugin/weekYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {groupBy} from "@schedulant/utils/array.ts";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type {MountArg, TimeStage} from "@schedulant/types/base.ts";
import type {PublicSchedulantApi} from "@schedulant/types/schedulant.ts";
import type {SchedulantViewType} from "@schedulant/types/schedulant-view.tsx";

dayjs.extend(isSameOrBefore);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

export type TimelineSlotArg = {
    schedulantApi: PublicSchedulantApi;
    date: Dayjs;
    level?: number;
    timeText?: string;
    slotType: SchedulantViewType;
}

export type TimelineSlotLaneMountArg = MountArg<TimelineSlotArg & TimeStage>;

export type TimelineSlotLabelMountArg = MountArg<TimelineSlotArg & TimeStage>;

export type TimelineData = {
    days: Dayjs[];
    weeks: Record<string, Dayjs[]>;
    months: Record<string, Dayjs[]>;
    quarters: Record<string, Dayjs[]>;
    years: Record<string, Dayjs[]>;
}

export class TimelineApi {
    private start: Dayjs;
    private end: Dayjs;
    private timelineData: TimelineData;
    private specialWorkdays?: Dayjs[];
    private companyHolidays?: Dayjs[];
    private nationalHolidays?: Dayjs[];
    // Performance optimization: cache position lookups
    private dayPositionCache: Map<string, number> = new Map();
    private weekPositionCache: Map<string, number> = new Map();
    private monthPositionCache: Map<string, number> = new Map();
    private quarterPositionCache: Map<string, number> = new Map();
    private yearPositionCache: Map<string, number> = new Map();

    private generateTimelineData(start: Dayjs, end: Dayjs): TimelineData {
        let currentDate: Dayjs = start.clone();
        const timelineData: TimelineData = {
            years: {},
            months: {},
            quarters: {},
            weeks: {},
            days: []
        };

        // Clear caches
        this.dayPositionCache.clear();
        this.weekPositionCache.clear();
        this.monthPositionCache.clear();
        this.quarterPositionCache.clear();
        this.yearPositionCache.clear();

        let dayIndex = 0;
        const weekIndexMap = new Map<string, number>();
        const monthIndexMap = new Map<string, number>();
        const quarterIndexMap = new Map<string, number>();
        const yearIndexMap = new Map<string, number>();

        while (currentDate.isSameOrBefore(end, "day")) {
            // calculate year.
            const yearKey = currentDate.startOf("year").format("YYYY-MM-DD");
            timelineData.years[yearKey] = timelineData.years[yearKey] || [];
            timelineData.years[yearKey].push(currentDate.clone());
            if (!yearIndexMap.has(yearKey)) {
                yearIndexMap.set(yearKey, yearIndexMap.size);
            }

            // calculate quarter.
            const quarterKey = currentDate.startOf("quarter").format("YYYY-MM-DD");
            timelineData.quarters[quarterKey] = timelineData.quarters[quarterKey] || [];
            timelineData.quarters[quarterKey].push(currentDate.clone());
            if (!quarterIndexMap.has(quarterKey)) {
                quarterIndexMap.set(quarterKey, quarterIndexMap.size);
            }

            // calculate month.
            const monthKey = currentDate.startOf("month").format("YYYY-MM-DD");
            timelineData.months[monthKey] = timelineData.months[monthKey] || [];
            timelineData.months[monthKey].push(currentDate.clone());
            if (!monthIndexMap.has(monthKey)) {
                monthIndexMap.set(monthKey, monthIndexMap.size);
            }

            // calculate week.
            const weekKey = currentDate.startOf("week").format("YYYY-MM-DD");
            timelineData.weeks[weekKey] = timelineData.weeks[weekKey] || [];
            timelineData.weeks[weekKey].push(currentDate.clone());
            if (!weekIndexMap.has(weekKey)) {
                weekIndexMap.set(weekKey, weekIndexMap.size);
            }

            // calculate day.
            timelineData.days.push(currentDate.clone());
            this.dayPositionCache.set(currentDate.format("YYYY-MM-DD"), dayIndex);
            dayIndex++;

            // next loop.
            currentDate = currentDate.add(1, "day");
        }

        // Build position caches for other granularities
        weekIndexMap.forEach((index, key) => {
            this.weekPositionCache.set(key, index);
        });
        monthIndexMap.forEach((index, key) => {
            this.monthPositionCache.set(key, index);
        });
        quarterIndexMap.forEach((index, key) => {
            this.quarterPositionCache.set(key, index);
        });
        yearIndexMap.forEach((index, key) => {
            this.yearPositionCache.set(key, index);
        });

        return timelineData;
    }

    constructor(start: Dayjs, end: Dayjs) {
        this.start = start;
        this.end = end;
        this.timelineData = this.generateTimelineData(start, end);
    }

    setStart(start: Dayjs): void {
        this.start = start;
        this.timelineData = this.generateTimelineData(start, this.getEnd());
    }

    getStart(): Dayjs {
        return this.start;
    }

    setEnd(end: Dayjs): void {
        this.end = end;
        this.timelineData = this.generateTimelineData(this.getStart(), end);
    }

    getEnd(): Dayjs {
        return this.end;
    }

    getDays(): Dayjs[] {
        return this.timelineData.days;
    }

    getWeeks(): Dayjs[] {
        return Object.keys(this.timelineData.weeks).map(weekKey => dayjs(weekKey));
    }

    getMonths(): Dayjs[] {
        return Object.keys(this.timelineData.months).map(monthKey => dayjs(monthKey));
    }

    getQuarters(): Dayjs[] {
        return Object.keys(this.timelineData.quarters).map(quarterKey => dayjs(quarterKey));
    }

    getYears(): Dayjs[] {
        return Object.keys(this.timelineData.years).map(yearKey => dayjs(yearKey));
    }

    setSpecialWorkdays(specialWorkdays: Dayjs[]): void {
        this.specialWorkdays = specialWorkdays;
    }

    getSpecialWorkdays(): Dayjs[] {
        return this.specialWorkdays || [];
    }

    setCompanyHolidays(companyHolidays: Dayjs[]): void {
        this.companyHolidays = companyHolidays;
    }

    getCompanyHolidays(): Dayjs[] {
        return this.companyHolidays || [];
    }

    setNationalHolidays(nationalHolidays: Dayjs[]): void {
        this.nationalHolidays = nationalHolidays;
    }

    getNationalHolidays(): Dayjs[] {
        return this.nationalHolidays || [];
    }

    isWeekend(target: Dayjs): boolean {
        return target.day() === 0 || target.day() === 6;
    }

    isHoliday(target: Dayjs): boolean {
        return (this.getCompanyHolidays().some(holiday => holiday.isSame(target, "day"))
                || this.getNationalHolidays().some(holiday => holiday.isSame(target, "day"))
                || this.isWeekend(target))
            && !this.getSpecialWorkdays().some(workday => workday.isSame(target, "day"))
    }

    isSpecialWorkday(target: Dayjs): boolean {
        return this.getSpecialWorkdays().some(workday => workday.isSame(target, "day"));
    }

    isCompanyHoliday(target: Dayjs): boolean {
        return this.getCompanyHolidays().some(holiday => holiday.isSame(target, "day"));
    }

    isNationalHoliday(target: Dayjs): boolean {
        return this.getNationalHolidays().some(holiday => holiday.isSame(target, "day"));
    }

    getDayPosition(target: Dayjs): number {
        const key = target.format("YYYY-MM-DD");
        const cachedPosition = this.dayPositionCache.get(key);
        if (cachedPosition !== undefined) {
            return cachedPosition;
        }
        // Fallback to findIndex if not in cache (should rarely happen)
        return this.getDays().findIndex(day => day.isSame(target, "day"));
    }

    getWeekPosition(target: Dayjs): number {
        const key = target.startOf("week").format("YYYY-MM-DD");
        const cachedPosition = this.weekPositionCache.get(key);
        if (cachedPosition !== undefined) {
            return cachedPosition;
        }
        return this.getWeeks().findIndex(week => week.isSame(target, "week"));
    }

    getMonthPosition(target: Dayjs): number {
        const key = target.startOf("month").format("YYYY-MM-DD");
        const cachedPosition = this.monthPositionCache.get(key);
        if (cachedPosition !== undefined) {
            return cachedPosition;
        }
        return this.getMonths().findIndex(month => month.isSame(target, "month"));
    }

    getQuarterPosition(target: Dayjs): number {
        const key = target.startOf("quarter").format("YYYY-MM-DD");
        const cachedPosition = this.quarterPositionCache.get(key);
        if (cachedPosition !== undefined) {
            return cachedPosition;
        }
        return this.getQuarters().findIndex(quarter => quarter.isSame(target, "quarter"));
    }

    getYearPosition(target: Dayjs): number {
        const key = target.startOf("year").format("YYYY-MM-DD");
        const cachedPosition = this.yearPositionCache.get(key);
        if (cachedPosition !== undefined) {
            return cachedPosition;
        }
        return this.getYears().findIndex(year => year.isSame(target, "year"));
    }

    populateMonthsWithDays(): Array<{ month: Dayjs; days: Dayjs[]; }> {
        const monthsAndDays = [];
        const months = this.timelineData.months;
        for (const key in months) {
            const monthAndDays: { month: Dayjs, days: Dayjs[] } = {month: dayjs(), days: []};
            monthAndDays.month = dayjs(key);
            monthAndDays.days = months[key];
            monthsAndDays.push(monthAndDays);
        }
        return monthsAndDays;
    }

    populateYearsWithDays(): Array<{ year: Dayjs; days: Dayjs[]; }> {
        const yearsAndDays = [];
        const years = this.timelineData.years;
        for (const key in years) {
            const yearAndDays: { year: Dayjs, days: Dayjs[] } = {year: dayjs(), days: []};
            yearAndDays.year = dayjs(key);
            yearAndDays.days = years[key];
            yearsAndDays.push(yearAndDays);
        }
        return yearsAndDays;
    }

    populateYearsWithWeeks(): Array<{ year: Dayjs; weeks: Dayjs[]; }> {
        const weeks: Dayjs[] = this.getWeeks();
        const groupArray = groupBy<Dayjs>(weeks, week => week.format("YYYY"));
        const yearsAndWeeks = [];
        for (const key in groupArray) {
            const yearAndWeeks: { year: Dayjs, weeks: Dayjs[] } = {year: dayjs(), weeks: []};
            yearAndWeeks.year = dayjs(key);
            yearAndWeeks.weeks = groupArray[key];
            yearsAndWeeks.push(yearAndWeeks);
        }
        return yearsAndWeeks;
    }

    populateYearsWithMonths(): Array<{ year: Dayjs; months: Dayjs[]; }> {
        const days = this.getDays();
        const months = Array.from(new Set(days.map(day => day.format("YYYY-MM")))).map(date => dayjs(date));
        const groupArray = groupBy<Dayjs>(months, month => month.format("YYYY"));
        const yearsAndMonths = [];
        for (const key in groupArray) {
            const yearAndMonths: { year: Dayjs, months: Dayjs[] } = {year: dayjs(), months: []};
            yearAndMonths.year = dayjs(key);
            yearAndMonths.months = groupArray[key];
            yearsAndMonths.push(yearAndMonths);
        }
        return yearsAndMonths;
    }

    populateYearsWithQuarters(): Array<{ year: Dayjs; quarters: Dayjs[]; }> {
        const days = this.getDays();
        const quarters = Array.from(new Set(days.map(day => day.startOf("quarter").format("YYYY-MM-DD")))).map(date => dayjs(date));
        const groupArray = groupBy<Dayjs>(quarters, quarter => quarter.format("YYYY"));
        const yearsAndQuarters = [];
        for (const key in groupArray) {
            const yearAndQuarters: { year: Dayjs; quarters: Dayjs[] } = {year: dayjs(), quarters: []};
            yearAndQuarters.year = dayjs(key);
            yearAndQuarters.quarters = groupArray[key];
            yearsAndQuarters.push(yearAndQuarters);
        }
        return yearsAndQuarters;
    }
}