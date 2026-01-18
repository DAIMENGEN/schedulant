import {type RefObject, useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import dayjs, {type Dayjs} from "dayjs";

export const useTimelineSlotLaneMount = (
    timelineSlotLaneRef: RefObject<HTMLTableCellElement | null>,
    schedulantApi: SchedulantApi,
    date: Dayjs
) => {
    const isPast = date.isBefore(dayjs(), "day");
    const isFuture = date.isAfter(dayjs(), "day");
    const isProcess = date.isSame(dayjs(), "day");
    useEffect(() => {
        const timelineSlotLane = timelineSlotLaneRef.current;
        if (timelineSlotLane) {
            schedulantApi.timelineSlotLaneDidMount({
                el: timelineSlotLane,
                isPast: isPast,
                isFuture: isFuture,
                isProcess: isProcess,
                date: date,
                slotType: schedulantApi.getSchedulantViewType(),
                schedulantApi: schedulantApi,
            });
            return () => {
                schedulantApi.timelineSlotLaneWillUnmount({
                    el: timelineSlotLane,
                    isPast: isPast,
                    isFuture: isFuture,
                    isProcess: isProcess,
                    date: date,
                    slotType: schedulantApi.getSchedulantViewType(),
                    schedulantApi: schedulantApi,
                });
            }
        }
    }, [date, isFuture, isPast, isProcess, schedulantApi, timelineSlotLaneRef])
}