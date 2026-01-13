import {StrictMode, useState} from "react"
import {type EventResizeMountArg, Schedulant} from "schedulant";
import {createRoot} from "react-dom/client"
import {Button, DatePicker, Select, Space, Tooltip} from "antd";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {mockResources} from "../mock-data/mock-resources.ts";
import {mockEvents} from "../mock-data/mock-events.tsx";
import {mockCheckpoints} from "../mock-data/mock-checkpoints.ts";
import {mockMilestones} from "../mock-data/mock-milestones.ts";
import "schedulant/dist/schedulant.css";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs, {type ManipulateType, type OpUnitType} from "dayjs";

dayjs.extend(isSameOrBefore);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

// 视图类型定义
type ViewType = "Day" | "Week" | "Month" | "Quarter" | "Year";

// 视图选项
const viewOptions = [
    { label: "日", value: "Day" as ViewType },
    { label: "周", value: "Week" as ViewType },
    { label: "月", value: "Month" as ViewType },
    { label: "季", value: "Quarter" as ViewType },
    { label: "年", value: "Year" as ViewType },
];

// 视图对应的时间单位
const viewUnitMap: Record<ViewType, "day" | "week" | "month" | "quarter" | "year"> = {
    Day: "day",
    Week: "week",
    Month: "month",
    Quarter: "quarter",
    Year: "year",
};

// 视图对应的 DatePicker picker 类型
const viewPickerMap: Record<ViewType, "date" | "week" | "month" | "quarter" | "year"> = {
    Day: "date",
    Week: "week",
    Month: "month",
    Quarter: "quarter",
    Year: "year",
};

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
    const [events, setEvents] = useState(mockEvents);
    const [resources, setResources] = useState(mockResources);
    const [milestones, setMilestones] = useState(mockMilestones);
    const [checkpoints, setCheckpoints] = useState(mockCheckpoints);
    const [ganttStartDate, setGanttStartDate] = useState<dayjs.Dayjs>(dayjs("2024-09-01"));
    const [ganttEndDate, setGanttEndDate] = useState<dayjs.Dayjs>(dayjs("2024-12-31"));

    // 视图类型状态
    const [viewType, setViewType] = useState<ViewType>("Day");

    // 向前移动时间范围（向左）
    const handleShiftLeft = () => {
        const unit = viewUnitMap[viewType] as ManipulateType;
        const duration = ganttEndDate.diff(ganttStartDate, unit);
        setGanttStartDate(ganttStartDate.subtract(duration, unit));
        setGanttEndDate(ganttEndDate.subtract(duration, unit));
    };

    // 向后移动时间范围（向右）
    const handleShiftRight = () => {
        const unit = viewUnitMap[viewType] as ManipulateType;
        const duration = ganttEndDate.diff(ganttStartDate, unit);
        setGanttStartDate(ganttStartDate.add(duration, unit));
        setGanttEndDate(ganttEndDate.add(duration, unit));
    };

    const handleEventResize = (eventResizeMountArg: EventResizeMountArg, field: 'start' | 'end') => {
        const {date, eventApi} = eventResizeMountArg;
        const targetId = eventApi.getId();
        setEvents(events => {
            const index = events.findIndex(e => e.id === targetId);
            if (index === -1) return events;
            const newEvents = [...events];
            newEvents[index] = {...events[index], [field]: date};
            return newEvents;
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <Space size="middle" style={{ marginBottom: '16px' }}>
                <Tooltip title="视图切换">
                    <Select
                        value={viewType}
                        onChange={(value) => setViewType(value)}
                        options={viewOptions}
                        style={{ width: 80 }}
                    />
                </Tooltip>
                <Tooltip title="向前移动时间范围">
                    <Button
                        type="primary"
                        icon={<LeftOutlined/>}
                        onClick={handleShiftLeft}
                    />
                </Tooltip>
                <Tooltip title="向后移动时间范围">
                    <Button
                        type="primary"
                        icon={<RightOutlined/>}
                        onClick={handleShiftRight}
                    />
                </Tooltip>
                <DatePicker
                    value={ganttStartDate}
                    onChange={(date) => date && setGanttStartDate(date)}
                    picker={viewPickerMap[viewType]}
                    placeholder="开始时间"
                    format={
                        viewType === "Day" ? "YYYY-MM-DD" :
                        viewType === "Week" ? "YYYY-wo" :
                        viewType === "Month" ? "YYYY-MM" :
                        viewType === "Quarter" ? "YYYY-Q" :
                        "YYYY"
                    }
                    style={{width: 140}}
                />
                <span>-</span>
                <DatePicker
                    value={ganttEndDate}
                    onChange={(date) => date && setGanttEndDate(date)}
                    picker={viewPickerMap[viewType]}
                    placeholder="结束时间"
                    format={
                        viewType === "Day" ? "YYYY-MM-DD" :
                        viewType === "Week" ? "YYYY-wo" :
                        viewType === "Month" ? "YYYY-MM" :
                        viewType === "Quarter" ? "YYYY-Q" :
                        "YYYY"
                    }
                    style={{width: 140}}
                    disabledDate={(current) => {
                        if (!ganttStartDate) return false;
                        const unit = viewUnitMap[viewType] as OpUnitType;
                        return current && current.isBefore(ganttStartDate, unit);
                    }}
                />
            </Space>
            <Schedulant end={ganttEndDate}
                        start={ganttStartDate}
                        editable={true}
                        selectable={true}
                        lineHeight={40}
                        slotMinWidth={50}
                        schedulantViewType={viewType}
                        schedulantMaxHeight={1000}
                        resources={resources}
                        events={events}
                        checkpoints={checkpoints}
                        milestones={milestones}
                        dragHintColor={"rgb(66, 133, 244, 0.08)"}
                        selectionColor={"rgba(66, 133, 244, 0.08)"}
                        resourceAreaColumns={[
                            {
                                field: "title",
                                headerContent: "Title",
                            },
                            // {
                            //     field: "order",
                            //     headerContent: "Order",
                            // },
                            // {
                            //     field: "parentId",
                            //     headerContent: "Parent",
                            // }
                        ]}
                        milestoneMove={(milestoneMoveMountArg) => {
                            const {date, milestoneApi} = milestoneMoveMountArg
                            const targetId = milestoneApi.getId();
                            setMilestones(milestones => {
                                const index = milestones.findIndex(m => m.id === targetId);
                                if (index === -1) return milestones;
                                const newMilestones = [...milestones];
                                newMilestones[index] = {...milestones[index], time: date};
                                return newMilestones;
                            });
                        }}
                        checkpointMove={(checkpointMoveMountArg) => {
                            const {date, checkpointApi} = checkpointMoveMountArg
                            const targetId = checkpointApi.getId();
                            setCheckpoints(checkpoints => {
                                const index = checkpoints.findIndex(c => c.id === targetId);
                                if (index === -1) return checkpoints;
                                const newCheckpoints = [...checkpoints];
                                newCheckpoints[index] = {...checkpoints[index], time: date};
                                return newCheckpoints;
                            });
                        }}
                        eventMove={(eventMoveMountArg) => {
                            const {startDate, endDate, eventApi} = eventMoveMountArg
                            const targetId = eventApi.getId();
                            setEvents(events => {
                                const index = events.findIndex(e => e.id === targetId);
                                if (index === -1) return events;
                                const newEvents = [...events];
                                newEvents[index] = {...events[index], start: startDate, end: endDate};
                                return newEvents;
                            });
                        }}
                        eventResizeStart={(eventResizeMountArg) => handleEventResize(eventResizeMountArg, 'start')}
                        eventResizeEnd={(eventResizeMountArg) => handleEventResize(eventResizeMountArg, 'end')}
                        resourceLaneMove={(resourceLaneMoveArg) => {
                            const {
                                draggedResourceApi,
                                targetResourceApi,
                                position,
                                oldParentResourceApi
                            } = resourceLaneMoveArg;
                            const draggedId = draggedResourceApi.getId();
                            const targetId = targetResourceApi.getId();
                            setResources(resources => {
                                const newResources = [...resources];
                                const draggedIndex = newResources.findIndex(r => r.id === draggedId);
                                if (draggedIndex === -1) return resources;
                                const draggedResource = {...newResources[draggedIndex]};
                                // Update parent based on position
                                if (position === 'child') {
                                    draggedResource.parentId = targetId;
                                } else {
                                    // 'before' or 'after' - same parent as target
                                    const targetResource = newResources.find(r => r.id === targetId);
                                    draggedResource.parentId = targetResource?.parentId;
                                }
                                // Calculate new order
                                const newParentId = draggedResource.parentId;
                                const siblingsInNewParent = newResources.filter(r =>
                                    r.parentId === newParentId && r.id !== draggedId
                                );
                                const targetResource = newResources.find(r => r.id === targetId);
                                const targetOrder = Number(targetResource?.extendedProps?.order ?? 0);
                                if (position === 'child') {
                                    // Add as first child
                                    draggedResource.extendedProps = {
                                        ...draggedResource.extendedProps,
                                        order: 1
                                    };
                                    // Increment order for existing children
                                    siblingsInNewParent.forEach(sibling => {
                                        const siblingIndex = newResources.findIndex(r => r.id === sibling.id);
                                        if (siblingIndex !== -1) {
                                            newResources[siblingIndex] = {
                                                ...newResources[siblingIndex],
                                                extendedProps: {
                                                    ...newResources[siblingIndex].extendedProps,
                                                    order: Number(newResources[siblingIndex].extendedProps?.order ?? 0) + 1
                                                }
                                            };
                                        }
                                    });
                                } else if (position === 'before') {
                                    draggedResource.extendedProps = {
                                        ...draggedResource.extendedProps,
                                        order: targetOrder
                                    };
                                    // Increment order for siblings at or after target
                                    siblingsInNewParent.forEach(sibling => {
                                        const siblingOrder = Number(sibling.extendedProps?.order ?? 0);
                                        if (siblingOrder >= targetOrder) {
                                            const siblingIndex = newResources.findIndex(r => r.id === sibling.id);
                                            if (siblingIndex !== -1) {
                                                newResources[siblingIndex] = {
                                                    ...newResources[siblingIndex],
                                                    extendedProps: {
                                                        ...newResources[siblingIndex].extendedProps,
                                                        order: siblingOrder + 1
                                                    }
                                                };
                                            }
                                        }
                                    });
                                } else { // 'after'
                                    draggedResource.extendedProps = {
                                        ...draggedResource.extendedProps,
                                        order: targetOrder + 1
                                    };
                                    // Increment order for siblings after target
                                    siblingsInNewParent.forEach(sibling => {
                                        const siblingOrder = Number(sibling.extendedProps?.order ?? 0);
                                        if (siblingOrder > targetOrder) {
                                            const siblingIndex = newResources.findIndex(r => r.id === sibling.id);
                                            if (siblingIndex !== -1) {
                                                newResources[siblingIndex] = {
                                                    ...newResources[siblingIndex],
                                                    extendedProps: {
                                                        ...newResources[siblingIndex].extendedProps,
                                                        order: siblingOrder + 1
                                                    }
                                                };
                                            }
                                        }
                                    });
                                }
                                // Update the dragged resource
                                newResources[draggedIndex] = draggedResource;
                                // Reorder siblings in old parent if parent changed
                                if (oldParentResourceApi?.getId() !== newParentId) {
                                    const oldParentId = oldParentResourceApi?.getId();
                                    const oldSiblings = newResources.filter(r => r.parentId === oldParentId && r.id !== draggedId);
                                    oldSiblings.sort((a, b) => Number(a.extendedProps?.order ?? 0) - Number(b.extendedProps?.order ?? 0));
                                    oldSiblings.forEach((sibling, index) => {
                                        const siblingIndex = newResources.findIndex(r => r.id === sibling.id);
                                        if (siblingIndex !== -1) {
                                            newResources[siblingIndex] = {
                                                ...newResources[siblingIndex],
                                                extendedProps: {
                                                    ...newResources[siblingIndex].extendedProps,
                                                    order: index + 1
                                                }
                                            };
                                        }
                                    });
                                }
                                return newResources;
                            });
                        }}
            />
        </div>
    );
}
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
