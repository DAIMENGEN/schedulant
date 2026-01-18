import {type RefObject, useEffect} from "react";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import dayjs, {type Dayjs} from "dayjs";

export const useTimelineSlotLabelMount = (
    timelineSlotLabelRef: RefObject<HTMLDivElement | null>,
    schedulantApi: SchedulantApi,
    date: Dayjs,
    level: number,
    timeText: string,
) => {
    const isPast = date.isBefore(dayjs(), "day");
    const isFuture = date.isAfter(dayjs(), "day");
    const isProcess = date.isSame(dayjs(), "day");

    useEffect(() => {
        const timelineSlotLabel = timelineSlotLabelRef.current;
        if (timelineSlotLabel) {
            schedulantApi.timelineSlotLabelDidMount({
                el: timelineSlotLabel,
                isPast: isPast,
                isFuture: isFuture,
                isProcess: isProcess,
                date: date,
                level: level,
                timeText: timeText,
                slotType: schedulantApi.getSchedulantViewType(),
                schedulantApi: schedulantApi,
            });
            return () => {
                schedulantApi.timelineSlotLabelWillUnmount({
                    el: timelineSlotLabel,
                    isPast: isPast,
                    isFuture: isFuture,
                    isProcess: isProcess,
                    date: date,
                    level: level,
                    timeText: timeText,
                    slotType: schedulantApi.getSchedulantViewType(),
                    schedulantApi: schedulantApi,
                });
            }
        }
    }, [date, isFuture, isPast, isProcess, level, schedulantApi, timeText, timelineSlotLabelRef]);
}