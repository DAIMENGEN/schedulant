import {type MouseEventHandler, type RefObject, useCallback, useEffect, useMemo, useRef} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {MilestoneApi} from "@schedulant/types/milestone.ts";
import {CheckpointApi} from "@schedulant/types/checkpoint.ts";
import {numberToPixels, pixelsToNumber} from "@schedulant/utils/dom.ts";
import throttle from "lodash/throttle";


export const useMoveTimelineMarker = (props: {
    markerRef: RefObject<HTMLDivElement | null>,
    timelineWidth: number,
    schedulantApi: SchedulantApi,
    milestoneApi?: MilestoneApi,
    checkpointApi?: CheckpointApi,
}) => {
    const markerPositionGuide = useMemo(() => "schedulant-timeline-marker-position-guide", []);
    const startXRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startRightRef = useRef<number>(0);
    const isDraggableRef = useRef<boolean>(false);

    const createPositionGuide = useCallback((element: HTMLDivElement) => {
        const left = element.style.left;
        const right = element.style.right;
        const height = props.milestoneApi ? props.schedulantApi.getLineHeight() * 1.5 : props.schedulantApi.getLineHeight();
        const positionGuide = document.createElement("div");
        positionGuide.className = markerPositionGuide;
        Object.assign(positionGuide.style, {
            position: "absolute",
            zIndex: 1,
            left: left,
            right: right,
            height: numberToPixels(height),
            backgroundColor: props.schedulantApi.getDragHintColor()
        });
        element.parentNode?.insertBefore(positionGuide, element);
    }, [props, markerPositionGuide]);

    const removePositionGuide = useCallback((element: HTMLDivElement) => {
        const positionGuide = element.previousElementSibling;
        if (positionGuide?.className === markerPositionGuide) {
            element.parentElement?.removeChild(positionGuide);
        }
    }, [markerPositionGuide]);

    const calculateMoveData = useCallback((clientX: number) => {
        const scheduleApi = props.schedulantApi;
        const scheduleView = scheduleApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const deltaX = clientX - startXRef.current;
        const totalWidth = props.timelineWidth;
        const totalSlots = timelineView.getTotalSlots();
        const moveSlots = Math.round((deltaX / totalWidth) * totalSlots);
        const distance = (moveSlots / totalSlots) * props.timelineWidth;
        return {
            moveSlots,
            distance,
            deltaX,
            totalWidth,
            totalSlots
        };
    }, [props]);

    const updatePositionGuide = useCallback((element: HTMLDivElement, clientX: number) => {
        const positionGuide = element.previousElementSibling as HTMLDivElement;
        if (positionGuide && positionGuide.className === markerPositionGuide) {
            const {distance} = calculateMoveData(clientX);
            positionGuide.style.left = numberToPixels(Math.max(startLeftRef.current + distance, 0));
            positionGuide.style.right = numberToPixels(startRightRef.current - distance);
        }
    }, [markerPositionGuide, calculateMoveData]);

    const updateMarkerPosition = useCallback((element: HTMLDivElement, clientX: number) => {
        const {moveSlots} = calculateMoveData(clientX);
        if (props.milestoneApi) {
            const date = props.milestoneApi.getTime().add(moveSlots, "day");
            props.schedulantApi.milestoneMove({
                el: element,
                date: date,
                schedulantApi: props.schedulantApi,
                milestoneApi: props.milestoneApi
            });
        } else if (props.checkpointApi) {
            const date = props.checkpointApi.getTime().add(moveSlots, "day");
            props.schedulantApi.checkpointMove({
                el: element,
                date: date,
                schedulantApi: props.schedulantApi,
                checkpointApi: props.checkpointApi
            });
        }
        startXRef.current = 0;
    }, [props, calculateMoveData]);

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        event.preventDefault();
        const marker = props.markerRef.current;
        const isDraggable = isDraggableRef.current;
        if (marker && isDraggable) {
            const deltaX = event.clientX - startXRef.current;
            const newLeft = startLeftRef.current + deltaX;
            const newRight = startRightRef.current - deltaX;
            marker.style.left = numberToPixels(newLeft);
            marker.style.right = numberToPixels(newRight);
            updatePositionGuide(marker, event.clientX);
        }
    }, [props.markerRef, updatePositionGuide]);

    // Throttled version for better performance
    const throttledHandleMouseMove = useMemo(
        () => throttle(handleMouseMove, 16), // ~60fps
        [handleMouseMove]
    );

    const handleMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const marker = props.markerRef.current;
        const isDraggable = isDraggableRef.current;
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        if (isDraggable && scheduleEl && marker) {
            removePositionGuide(marker);
            updateMarkerPosition(marker, event.clientX);
            scheduleEl.removeEventListener("mousemove", throttledHandleMouseMove);
            isDraggableRef.current = false;
        }
    }, [throttledHandleMouseMove, props.markerRef, props.schedulantApi, removePositionGuide, updateMarkerPosition]);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const marker = props.markerRef.current;
        if (scheduleEl && marker) {
            isDraggableRef.current = true;
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(marker.style.left);
            startRightRef.current = pixelsToNumber(marker.style.right);
            createPositionGuide(marker);
            scheduleEl.addEventListener("mousemove", throttledHandleMouseMove);
        }
    }, [createPositionGuide, throttledHandleMouseMove, props.markerRef, props.schedulantApi]);

    useEffect(() => {
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const marker = props.markerRef.current;
        if (scheduleEl && marker) {
            const timelineLaneFrame = marker.parentElement?.parentElement;
            if (timelineLaneFrame) {
                const handleMouseOutOrUp = (event: globalThis.MouseEvent) => {
                    event.preventDefault();
                    const isDraggable = isDraggableRef.current;
                    if (isDraggable && !timelineLaneFrame.contains(event.relatedTarget as Node)) {
                        removePositionGuide(marker);
                        updateMarkerPosition(marker, event.clientX);
                        // 重置样式到初始位置，等待数据驱动的重新渲染
                        marker.style.left = numberToPixels(startLeftRef.current);
                        marker.style.right = numberToPixels(startRightRef.current);
                        scheduleEl.removeEventListener("mousemove", throttledHandleMouseMove);
                        isDraggableRef.current = false;
                    }
                }
                timelineLaneFrame.addEventListener("mouseup", handleMouseOutOrUp);
                timelineLaneFrame.addEventListener("mouseout", handleMouseOutOrUp);
                return () => {
                    timelineLaneFrame.removeEventListener("mouseup", handleMouseOutOrUp);
                    timelineLaneFrame.removeEventListener("mouseout", handleMouseOutOrUp);
                }
            }
        }
    }, [throttledHandleMouseMove, props, removePositionGuide, updateMarkerPosition]);

    return {handleMouseUp, handleMouseDown}
}