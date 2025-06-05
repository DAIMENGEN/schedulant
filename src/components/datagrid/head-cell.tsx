import type {ResourceAreaColumn} from "@schedulant/types/resource.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {type MouseEventHandler, useCallback, useEffect, useRef} from "react";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import {useResourceLabelMount} from "@schedulant/hooks/mounts/use-resource-label-mount.tsx";
import {Dropdown} from "antd";
import {If} from "@schedulant/utils/if.tsx";

export const HeadCell = (props: {
    schedulantApi: SchedulantApi,
    resourceAreaColumn: ResourceAreaColumn,
    isResizable: boolean
}) => {
    const indexRef = useRef<number>(-1);
    const resourceLabelCellRef = useRef<HTMLDivElement | null>(null);
    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const index = indexRef.current;
        const datagridHeader = document.querySelector(".schedulant-datagrid-header");
        const datagridBody = document.querySelector(".schedulant-datagrid-body");
        const headerColgroup = datagridHeader?.firstElementChild;
        const bodyColgroup = datagridBody?.firstElementChild;
        const headerColElements = headerColgroup?.children;
        const bodyColElements = bodyColgroup?.children
        if (headerColElements && bodyColElements) {
            const targetHeaderColElement = headerColElements[index] as HTMLTableColElement;
            const targetBodyColElement = bodyColElements[index] as HTMLTableColElement;
            const headerColElementOffset = event.clientX - targetHeaderColElement.offsetLeft;
            const bodyColElementOffset = event.clientX - targetBodyColElement.offsetLeft;
            targetHeaderColElement.style.width = numberToPixels(headerColElementOffset);
            targetBodyColElement.style.width = numberToPixels(bodyColElementOffset);
        }
    }, []);
    const handleMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const trElement = resourceLabelCellRef.current?.parentElement?.parentElement;
        if (trElement) {
            indexRef.current = -1;
            trElement.removeEventListener("mousemove", handleMouseMove);
        } else {
            console.error("trElement", trElement);
        }
    }, [handleMouseMove]);
    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const thElement = resourceLabelCellRef.current?.parentElement;
        const trElement = resourceLabelCellRef.current?.parentElement?.parentElement;
        if (trElement) {
            const thElements = trElement.getElementsByTagName("th");
            for (let i = 0; i < thElements.length; i++) {
                if (thElements[i] == thElement) {
                    indexRef.current = i;
                }
            }
            trElement.addEventListener("mousemove", handleMouseMove);
        } else {
            console.error("trElement", trElement);
        }
    }, [handleMouseMove]);
    useEffect(() => {
        const trElement = resourceLabelCellRef.current?.parentElement?.parentElement;
        if (trElement) {
            const mouseUpListener = (event: MouseEvent) => {
                event.preventDefault();
                indexRef.current = -1;
                trElement.removeEventListener("mousemove", handleMouseMove);
            }
            trElement.addEventListener("mouseup", mouseUpListener);
            return () => {
                trElement.removeEventListener("mouseup", mouseUpListener);
            }
        }
        return () => {
        }
    }, [handleMouseMove]);
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
                        <div className={"schedulant-datagrid-cell-resizer"} onMouseUp={handleMouseUp}
                             onMouseDown={handleMouseDown}></div>
                    </If>
                </div>
            </Dropdown>
        </th>
    )
}