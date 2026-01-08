import {type RefObject, useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {CheckpointApi} from "@schedulant/types/checkpoint.ts";
import dayjs from "dayjs";

export const useCheckpointMount = (
    timelineCheckpointRef: RefObject<HTMLDivElement | null>,
    schedulantApi: SchedulantApi,
    checkpointApi: CheckpointApi,
    ) => {
    const timestamp = checkpointApi.getTime();
    const isPast = timestamp.isBefore(dayjs(), "day");
    const isFuture = timestamp.isAfter(dayjs(), "day");
    const isProcess = timestamp.isSame(dayjs(), "day");
    useEffect(() => {
        const timelineCheckpoint = timelineCheckpointRef.current;
        if (timelineCheckpoint) {
            schedulantApi.checkpointDidMount({
                el: timelineCheckpoint,
                isPast: isPast,
                isFuture: isFuture,
                isProcess: isProcess,
                checkpointApi: checkpointApi,
                schedulantApi: schedulantApi,
            });
            return () => {
                schedulantApi.checkpointWillUnmount({
                    el: timelineCheckpoint,
                    isPast: isPast,
                    isFuture: isFuture,
                    isProcess: isProcess,
                    checkpointApi: checkpointApi,
                    schedulantApi: schedulantApi,
                });
            }
        }
    }, [schedulantApi, checkpointApi, timelineCheckpointRef, isPast, isFuture, isProcess]);
    return {isPast, isFuture, isProcess};
}