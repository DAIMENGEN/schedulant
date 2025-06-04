import {type MutableRefObject, useEffect} from "react";
import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export const useSchedulantMount = (schedulantElRef: MutableRefObject<HTMLDivElement | null>, scheduleView: SchedulantView) => {
    useEffect(() => {
        const schedulantEl = schedulantElRef.current;
        const schedulantApi = scheduleView.getScheduleApi();
        if (schedulantEl) {
            schedulantApi.schedulantDidMount({
                el: schedulantEl,
                schedulantApi: schedulantApi
            });
            return () => {
                schedulantApi.schedulantWillUnmount({
                    el: schedulantEl,
                    schedulantApi: schedulantApi,
                });
            }
        }
        return () => {
        }
    }, [schedulantElRef, scheduleView]);
}