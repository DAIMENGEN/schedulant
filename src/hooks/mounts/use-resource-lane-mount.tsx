import {type RefObject, useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {ResourceApi, type ResourceAreaColumn} from "@schedulant/types/resource.ts";

export const useResourceLaneMount = (
    resourceLaneCellRef: RefObject<HTMLDivElement | null>,
    resourceAreaColumn: ResourceAreaColumn,
    schedulantApi: SchedulantApi,
    resourceApi: ResourceApi,
) => {
    useEffect(() => {
        const resourceLaneCell = resourceLaneCellRef.current;
        if (resourceLaneCell) {
            schedulantApi.resourceLaneDidMount({
                el: resourceLaneCell,
                schedulantApi: schedulantApi,
                resourceApi: resourceApi,
                label: resourceAreaColumn,
            });
            return () => {
                schedulantApi.resourceLaneWillUnmount({
                    el: resourceLaneCell,
                    schedulantApi: schedulantApi,
                    resourceApi: resourceApi,
                    label: resourceAreaColumn,
                });
            }
        }
    }, [resourceLaneCellRef, resourceAreaColumn, schedulantApi, resourceApi]);
}