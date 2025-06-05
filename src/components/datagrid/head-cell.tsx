import type {ResourceAreaColumn} from "@schedulant/types/resource.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {useRef} from "react";
import {useResourceLabelMount} from "@schedulant/hooks/mounts/use-resource-label-mount.tsx";
import {Dropdown} from "antd";
import {If} from "@schedulant/utils/if.tsx";
import {type DatagridBodyCellResizerMouseDown} from "@schedulant/hooks/use-resource-area-resizer.ts";

export const HeadCell = (props: {
    schedulantApi: SchedulantApi,
    resourceAreaColumn: ResourceAreaColumn,
    isResizable: boolean,
    handleMouseDown: DatagridBodyCellResizerMouseDown
}) => {
    const resourceLabelCellRef = useRef<HTMLDivElement>(null);
    useResourceLabelMount(resourceLabelCellRef, props.resourceAreaColumn, props.schedulantApi);
    return (
        <th role={"columnheader"} className={"schedulant-datagrid-cell"}>
            <Dropdown disabled={!props.schedulantApi.isEnableResourceLabelContextMenu()}
                      destroyOnHidden={true}
                      trigger={["contextMenu"]}
                      menu={{
                          items: props.schedulantApi.getResourceLabelContextMenuItems(),
                          onClick: (arg) => {
                              const {key, keyPath, domEvent} = arg;
                              props.schedulantApi.onResourceLabelContextMenuClick({
                                  key: key,
                                  keyPath: keyPath,
                                  domEvent: domEvent,
                                  label: props.resourceAreaColumn,
                              });
                          }
                      }}>
                <div className={"schedulant-datagrid-cell-frame"} ref={resourceLabelCellRef}>
                    <div className={"schedulant-datagrid-cell-cushion schedulant-scrollgrid-sync-inner"}>
                        <span
                            className={"schedulant-datagrid-cell-main"}>{props.resourceAreaColumn.headerContent}</span>
                    </div>
                    <If condition={props.isResizable}>
                        <div className={"schedulant-datagrid-cell-resizer"}
                             onMouseDown={props.handleMouseDown(resourceLabelCellRef)}/>
                    </If>
                </div>
            </Dropdown>
        </th>
    )
}