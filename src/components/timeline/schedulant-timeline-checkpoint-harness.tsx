import type {CheckpointApi} from "@schedulant/types/checkpoint.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Position} from "@schedulant/types/base.ts";
import {useRef} from "react";
import {useCheckpointMount} from "@schedulant/hooks/mounts/use-checkpoint-mount.tsx";
import {useMoveTimelineMarker} from "@schedulant/hooks/use-move-timeline-marker.tsx";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import {Dropdown} from "antd";
import {DropletIcon} from "@schedulant/icons/droplet-icon.tsx";

export const SchedulantTimelineCheckpointHarness = (props: {
    schedulantApi: SchedulantApi,
    checkpointApi: CheckpointApi,
    timelineWidth: number,
    position: Position
}) => {
    const timelineCheckpointRef = useRef<HTMLDivElement | null>(null);
    const timelineCheckpointHarnessRef = useRef<HTMLDivElement | null>(null);
    const isEditable = props.schedulantApi.isEditable();
    const color = props.checkpointApi.getColor().getOrElse("black");
    const timelineView = props.schedulantApi.getScheduleView().getTimelineView();
    const laneHeight = timelineView.calculateLaneHeight(props.checkpointApi.getResourceApi());
    const eventHeight = timelineView.calculateEventHeight();
    const top = (laneHeight - eventHeight) / 2 + 2;
    const {
        isPast,
        isFuture,
        isProcess
    } = useCheckpointMount(timelineCheckpointRef, props.schedulantApi, props.checkpointApi);
    const {handleMouseUp, handleMouseDown} = useMoveTimelineMarker({
        markerRef: timelineCheckpointHarnessRef,
        timelineWidth: props.timelineWidth,
        schedulantApi: props.schedulantApi,
        checkpointApi: props.checkpointApi
    });
    return (
        <div className={"schedulant-timeline-checkpoint-harness"} style={{
            top: numberToPixels(top),
            height: numberToPixels(eventHeight),
            lineHeight: numberToPixels(eventHeight),
            left: numberToPixels(props.position.left),
            right: numberToPixels(props.position.right),
        }} onMouseUp={isEditable ? handleMouseUp : void 0} onMouseDown={isEditable ? handleMouseDown : void 0}
             ref={timelineCheckpointHarnessRef}>
            <Dropdown disabled={!props.schedulantApi.isEnableCheckpointContextMenu()}
                      destroyOnHidden={true}
                      trigger={["contextMenu"]}
                      menu={{
                          items: props.schedulantApi.getCheckpointContextMenuItems(),
                          onClick: (arg) => {
                              const {key, keyPath, domEvent} = arg;
                              props.schedulantApi.onCheckpointContextMenuClick({
                                  key: key,
                                  keyPath: keyPath,
                                  domEvent: domEvent,
                                  isPast: isPast,
                                  isFuture: isFuture,
                                  isProcess: isProcess,
                                  checkpointApi: props.checkpointApi,
                                  schedulantApi: props.schedulantApi,
                              })
                          }
                      }}>
                <div className={"schedulant-timeline-checkpoint"} ref={timelineCheckpointRef}>
                    <div className={"schedulant-checkpoint-main"}>
                        <DropletIcon width={eventHeight} height={eventHeight} color={color}/>
                    </div>
                </div>
            </Dropdown>
        </div>
    )
}