import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Resource, ResourceApi, ResourceAreaColumn} from "@schedulant/types/resource.ts";
import {useCallback, useRef} from "react";
import {useResourceLaneMount} from "@schedulant/hooks/mounts/use-resource-lane-mount.tsx";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import {Dropdown, Space} from "antd";
import {MinusSquareOutlined, PlusSquareOutlined} from "@ant-design/icons";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import {type DatagridBodyCellResizerMouseDown} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {If} from "@schedulant/utils/if.tsx";

export const BodyCell = (props: {
    schedulantApi: SchedulantApi,
    resourceApi: ResourceApi,
    collapseIds: Array<string>,
    showPlusSquare: boolean,
    showIndentation: boolean,
    resourceAreaColumn: ResourceAreaColumn,
    isResizable: boolean,
    handleMouseDown: DatagridBodyCellResizerMouseDown
}) => {
    const {dispatch} = useSchedulantContext();
    const resourceLaneCellRef = useRef<HTMLDivElement>(null);
    const timelineView = props.schedulantApi.getScheduleView().getTimelineView();
    const laneHeight = timelineView.calculateLaneHeight(props.resourceApi);
    const getResourceColumnValue = useCallback((column: string, resourceApi: ResourceApi): string | number | "" => {
        const resource = resourceApi.getResource();
        const properties = Object.keys(resource);
        if (properties.includes(column)) {
            const property = column as keyof Resource;
            const value = resource[property];
            if (typeof value === "string") {
                return value;
            }
        } else {
            const extendedProps = resource.extendedProps as Record<string, unknown> | undefined;
            const value = extendedProps?.[column];
            if (typeof value === "string" || typeof value === "number") {
                return value;
            }
        }
        return ""; // fallback
    }, []);
    useResourceLaneMount(resourceLaneCellRef, props.resourceAreaColumn, props.schedulantApi, props.resourceApi);
    return (
        <td role={"gridcell"} data-resource-id={props.resourceApi.getId()}
            className={"schedulant-datagrid-cell schedulant-resource"}>
            <Dropdown disabled={!props.schedulantApi.isEnableResourceLaneContextMenu()}
                      destroyOnHidden={true}
                      trigger={["contextMenu"]}
                      menu={{
                          items: props.schedulantApi.getResourceLaneContextMenuItems(),
                          onClick: (arg) => {
                              const {key, keyPath, domEvent} = arg;
                              props.schedulantApi.onResourceLaneContextMenuClick({
                                  key: key,
                                  keyPath: keyPath,
                                  domEvent: domEvent,
                                  schedulantApi: props.schedulantApi,
                                  resourceApi: props.resourceApi,
                                  label: props.resourceAreaColumn,
                              });
                          }
                      }}>
                <div className={"schedulant-datagrid-cell-frame"} style={{height: numberToPixels(laneHeight)}}
                     ref={resourceLaneCellRef}>
                    <div className={"schedulant-datagrid-cell-cushion schedulant-scrollgrid-sync-inner"}>
                        <Space size={"small"}>
                            {
                                props.showPlusSquare && (
                                    <span
                                        className={"schedulant-datagrid-expander schedulant-datagrid-expander-placeholder"}>
                                    {
                                        props.showIndentation && Array.from({length: props.resourceApi.getDepth()}, (_, index) =>
                                            <span key={index + 1} className={"schedulant-icon"}/>)
                                    }
                                        <span className={"schedulant-icon"}>
                                        {
                                            props.collapseIds.some((resourceId: string) => resourceId === props.resourceApi.getId()) ?
                                                <PlusSquareOutlined
                                                    onClick={() => dispatch({
                                                        type: "EXPAND_RESOURCE",
                                                        id: props.resourceApi.getId()
                                                    })}/> :
                                                props.resourceApi.getChildren().length > 0 ? <MinusSquareOutlined
                                                    onClick={() => dispatch({
                                                        type: "COLLAPSE_RESOURCE",
                                                        id: props.resourceApi.getId()
                                                    })}/> : null
                                        }
                                    </span>
                                </span>
                                )
                            }
                            <div className={"schedulant-datagrid-cell-main"}>
                                {getResourceColumnValue(props.resourceAreaColumn.field, props.resourceApi)}
                            </div>
                        </Space>
                    </div>
                    <If condition={props.isResizable}>
                        <div className={"schedulant-datagrid-cell-resizer"} onMouseDown={props.handleMouseDown(resourceLaneCellRef)}/>
                    </If>
                </div>
            </Dropdown>
        </td>
    )
}