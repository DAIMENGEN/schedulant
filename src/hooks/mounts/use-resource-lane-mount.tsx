import React, {useEffect} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {ResourceApi, type ResourceAreaColumn} from "@schedulant/types/resource.ts";

export const useResourceLaneMount = (
    resourceLaneCellRef: React.MutableRefObject<HTMLDivElement | null>,
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
        } else {
            return () => {
            }
        }
    }, [resourceLaneCellRef, resourceAreaColumn, schedulantApi, resourceApi]);
}