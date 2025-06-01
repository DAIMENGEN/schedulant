import type {Dayjs} from "dayjs";

export type SchedulantProps = {
    end: Dayjs,
    start: Dayjs,
    lineHeight: number;
    slotMinWidth: number;
    schedulantMaxHeight: number;
}