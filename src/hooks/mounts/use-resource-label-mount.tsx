import {type RefObject, useEffect} from "react";
import type {ResourceAreaColumn} from "@schedulant/types/resource.ts";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";

export const useResourceLabelMount = (
    resourceLabelCellRef: RefObject<HTMLDivElement | null>,
    resourceAreaColumn: ResourceAreaColumn,
    schedulantApi: SchedulantApi,
) => {
    useEffect(() => {
        const resourceLabelCell = resourceLabelCellRef.current;
        if (resourceLabelCell) {
            schedulantApi.resourceLabelDidMount({
                el: resourceLabelCell,
                label: resourceAreaColumn,
            });
            return () => {
                schedulantApi.resourceLabelWillUnmount({
                    el: resourceLabelCell,
                    label: resourceAreaColumn,
                });
            }
        }
    }, [resourceLabelCellRef, resourceAreaColumn, schedulantApi]);
}