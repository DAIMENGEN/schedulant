import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {MilestoneApi} from "@schedulant/types/milestone.ts";
import {CheckpointApi} from "@schedulant/types/checkpoint.ts";
import {numberToPixels, pixelsToNumber} from "@schedulant/utils/dom.ts";

export const useMoveTimelineMarker = (props: {
    markerRef: React.MutableRefObject<HTMLDivElement | null>,
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
            backgroundColor: "rgb(188, 232, 241, 0.7)"
        });
        element.parentNode?.insertBefore(positionGuide, element);
    }, [props, markerPositionGuide]);

    const removePositionGuide = useCallback((element: HTMLDivElement) => {
        const positionGuide = element.previousElementSibling;
        if (positionGuide?.className === markerPositionGuide) {
            element.parentElement?.removeChild(positionGuide);
        }
    }, [markerPositionGuide]);

    const updatePositionGuide = useCallback((element: HTMLDivElement, clientX: number) => {
        const positionGuide = element.previousElementSibling as HTMLDivElement;
        if (positionGuide && positionGuide.className === markerPositionGuide) {
            const scheduleApi = props.schedulantApi;
            const scheduleView = scheduleApi.getScheduleView();
            const timelineView = scheduleView.getTimelineView();
            const slotWidth = timelineView.calculateSlotWidth(props.timelineWidth);
            const deltaX = clientX - startXRef.current;
            const offsetRatio = deltaX / slotWidth;
            const multiple = Math.round(offsetRatio);
            const distance = multiple * slotWidth;
            if (Math.sign(deltaX) === 1) {
                const newLeft = Math.min(startLeftRef.current + distance, props.timelineWidth - slotWidth);
                const newRight = Math.max(startRightRef.current - distance, props.timelineWidth * -1);
                positionGuide.style.left = numberToPixels(newLeft);
                positionGuide.style.right = numberToPixels(newRight);
            } else if (Math.sign(deltaX) === -1) {
                const newLeft = Math.max(startLeftRef.current + distance, 0);
                const newRight = Math.min(startRightRef.current - distance, slotWidth * -1);
                positionGuide.style.left = numberToPixels(newLeft);
                positionGuide.style.right = numberToPixels(newRight);
            }
        }
    }, [props, markerPositionGuide]);

    const updateMarkerPosition = useCallback((element: HTMLDivElement, clientX: number) => {
        const scheduleApi = props.schedulantApi;
        const scheduleView = scheduleApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const slotWidth = timelineView.calculateSlotWidth(props.timelineWidth);
        const deltaX = clientX - startXRef.current;
        const offsetRatio = deltaX / slotWidth;
        const multiple = Math.round(offsetRatio);
        const distance = multiple * slotWidth;
        if (Math.sign(deltaX) === 1) {
            const newLeft = Math.min(startLeftRef.current + distance, props.timelineWidth - slotWidth);
            const newRight = Math.max(startRightRef.current - distance, props.timelineWidth * -1);
            element.style.left = numberToPixels(newLeft);
            element.style.right = numberToPixels(newRight);
        } else if (Math.sign(deltaX) === -1) {
            const newLeft = Math.max(startLeftRef.current + distance, 0);
            const newRight = Math.min(startRightRef.current - distance, slotWidth * -1);
            element.style.left = numberToPixels(newLeft);
            element.style.right = numberToPixels(newRight);
        }
        const right = pixelsToNumber(element.style.right);
        const date = timelineView.calculateDate(props.timelineWidth, right * -1);
        if (props.milestoneApi) {
            props.milestoneApi.setTime(date);
            props.schedulantApi.milestoneMove({
                el: element,
                date: date,
                schedulantApi: scheduleApi,
                milestoneApi: props.milestoneApi
            });
        } else if (props.checkpointApi) {
            props.checkpointApi.setTime(date);
            props.schedulantApi.checkpointMove({
                el: element,
                date: date,
                schedulantApi: scheduleApi,
                checkpointApi: props.checkpointApi
            });
        }
        startXRef.current = 0;
    }, [props]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
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

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const marker = props.markerRef.current;
        const isDraggable = isDraggableRef.current;
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        if (isDraggable && scheduleEl && marker) {
            removePositionGuide(marker);
            updateMarkerPosition(marker, event.clientX);
            scheduleEl.removeEventListener("mousemove", handleMouseMove);
            isDraggableRef.current = false;
        }
    }, [handleMouseMove, props.markerRef, props.schedulantApi, removePositionGuide, updateMarkerPosition]);

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const marker = props.markerRef.current;
        if (scheduleEl && marker) {
            isDraggableRef.current = true;
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(marker.style.left);
            startRightRef.current = pixelsToNumber(marker.style.right);
            createPositionGuide(marker);
            scheduleEl.addEventListener("mousemove", handleMouseMove);
        }
    }, [createPositionGuide, handleMouseMove, props.markerRef, props.schedulantApi]);

    useEffect(() => {
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const marker = props.markerRef.current;
        if (scheduleEl && marker) {
            const timelineLaneFrame = marker.parentElement?.parentElement;
            if (timelineLaneFrame) {
                const handleMouseOutOrUp = (event: MouseEvent) => {
                    event.preventDefault();
                    const isDraggable = isDraggableRef.current;
                    if (isDraggable && !timelineLaneFrame.contains(event.relatedTarget as Node)) {
                        removePositionGuide(marker);
                        updateMarkerPosition(marker, event.clientX);
                        scheduleEl.removeEventListener("mousemove", handleMouseMove);
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
        return () => {
        }
    }, [handleMouseMove, props, removePositionGuide, updateMarkerPosition]);

    return {handleMouseUp, handleMouseDown}
}