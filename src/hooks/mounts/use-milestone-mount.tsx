import React, {useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {MilestoneApi} from "@schedulant/types/milestone.ts";
import dayjs from "dayjs";

export const useMilestoneMount = (
    timelineMilestoneRef: React.MutableRefObject<HTMLDivElement | null>,
    schedulantApi: SchedulantApi,
    milestoneApi: MilestoneApi,
) => {
    const timestamp = milestoneApi.getTime();
    const isPast = timestamp.isBefore(dayjs(), "day");
    const isFuture = timestamp.isAfter(dayjs(), "day");
    const isProcess = timestamp.isSame(dayjs(), "day");
    useEffect(() => {
        const timelineMilestone = timelineMilestoneRef.current;
        if (timelineMilestone) {
            schedulantApi.milestoneDidMount({
                el: timelineMilestone,
                isPast: isPast,
                isFuture: isFuture,
                isProcess: isProcess,
                milestoneApi: milestoneApi,
                schedulantApi: schedulantApi,
            });
            return () => {
                schedulantApi.milestoneWillUnmount({
                    el: timelineMilestone,
                    isPast: isPast,
                    isFuture: isFuture,
                    isProcess: isProcess,
                    milestoneApi: milestoneApi,
                    schedulantApi: schedulantApi,
                });
            }
        }
        return () => {}
    }, [schedulantApi, milestoneApi, timelineMilestoneRef, isPast, isFuture, isProcess]);
    return {isPast, isFuture, isProcess};
}