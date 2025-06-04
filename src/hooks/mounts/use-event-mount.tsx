import React, {useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {EventApi} from "@schedulant/types/event.ts";
import dayjs from "dayjs";

export const useEventMount = (
    timelineEventRef: React.MutableRefObject<HTMLDivElement | null>,
    schedulantApi: SchedulantApi,
    eventApi: EventApi,
) => {
    const timelineApi = schedulantApi.getTimelineApi();
    const startDate = eventApi.getStart();
    const endDate = eventApi.getEnd().getOrElse(timelineApi.getEnd());
    const isPast = endDate.isBefore(dayjs(), "day");
    const isFuture = startDate.isAfter(dayjs(), "day");
    const isProcess = startDate.isSameOrBefore(dayjs(), "day") && (endDate.isAfter(dayjs(), "day") || endDate.isSame(dayjs(), "day"));
    useEffect(() => {
        const timelineEvent = timelineEventRef.current;
        if (timelineEvent) {
            schedulantApi.eventDidMount({
                el: timelineEvent,
                isPast: isPast,
                isFuture: isFuture,
                isProcess: isProcess,
                eventApi: eventApi,
                schedulantApi: schedulantApi,
            });
            return () => {
                schedulantApi.eventWillUnmount({
                    el: timelineEvent,
                    isPast: isPast,
                    isFuture: isFuture,
                    isProcess: isProcess,
                    eventApi: eventApi,
                    schedulantApi: schedulantApi,
                });
            }
        } else {
            return () => {}
        }
    }, [timelineEventRef, schedulantApi, eventApi, isPast, isFuture, isProcess]);
    return {isPast, isFuture, isProcess};
}