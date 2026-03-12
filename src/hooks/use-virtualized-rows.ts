import {type RefObject, useCallback, useMemo} from "react";
import {useVirtualizer, type Virtualizer} from "@tanstack/react-virtual";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import {MILESTONE_LANE_HEIGHT_MULTIPLIER} from "@schedulant/constants.ts";

export type VirtualizedRowsResult = {
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    visibleResources: ResourceApi[];
};

/**
 * Compute the flat list of visible resources respecting collapse state.
 */
export function computeVisibleResources(
    topLevelResources: ResourceApi[],
    collapseIds: string[]
): ResourceApi[] {
    const result: ResourceApi[] = [];
    const collect = (resourceApi: ResourceApi) => {
        result.push(resourceApi);
        const isCollapsed = collapseIds.some(id => id === resourceApi.getId());
        if (!isCollapsed && resourceApi.getChildren().length > 0) {
            resourceApi.getChildren().forEach(child => collect(child));
        }
    };
    topLevelResources.forEach(r => collect(r));
    return result;
}

export const useVirtualizedRows = (
    scrollerRef: RefObject<HTMLDivElement | null>,
    topLevelResources: ResourceApi[],
    collapseIds: string[],
    lineHeight: number,
    timelineStart: import("dayjs").Dayjs,
    timelineEnd: import("dayjs").Dayjs,
): VirtualizedRowsResult => {
    const visibleResources = useMemo(
        () => computeVisibleResources(topLevelResources, collapseIds),
        [topLevelResources, collapseIds]
    );

    const getRowHeight = useCallback((index: number) => {
        const resource = visibleResources[index];
        if (!resource) return lineHeight;
        const hasMilestone = resource.getMilestoneApis().some(
            m => !m.getTime().isBefore(timelineStart) && !m.getTime().isAfter(timelineEnd)
        );
        return hasMilestone ? lineHeight * MILESTONE_LANE_HEIGHT_MULTIPLIER : lineHeight;
    }, [visibleResources, lineHeight, timelineStart, timelineEnd]);

    const virtualizer = useVirtualizer({
        count: visibleResources.length,
        getScrollElement: () => scrollerRef.current,
        estimateSize: getRowHeight,
        overscan: 5,
    });

    return {virtualizer, visibleResources};
};
