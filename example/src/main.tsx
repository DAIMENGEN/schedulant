import dayjs from "./dayjs-config.ts";
import {StrictMode, useState} from "react"
import {type EventResizeMountArg, Schedulant} from "schedulant";
import {createRoot} from "react-dom/client"
import {DatePicker} from "antd";
import {mockResources} from "../mock-data/mock-resources.ts";
import {mockEvents} from "../mock-data/mock-events.tsx";
import {mockCheckpoints} from "../mock-data/mock-checkpoints.ts";
import {mockMilestones} from "../mock-data/mock-milestones.ts";
import "schedulant/dist/schedulant.css";
import type {Dayjs} from "dayjs";


// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
    const {RangePicker} = DatePicker;
    const [events, setEvents] = useState(mockEvents);
    const [resources, setResources] = useState(mockResources);
    const [milestones, setMilestones] = useState(mockMilestones);
    const [checkpoints, setCheckpoints] = useState(mockCheckpoints);
    const [startDate, setStartDate] = useState<Dayjs>(dayjs("2024-05-10"));
    const [endDate, setEndDate] = useState<Dayjs>(dayjs("2025-09-09"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRangeChange = (dates: any) => {
        // dates 是 dayjs 对象数组 [start, end]，可能为空
        if (dates) {
            setStartDate(dates[0]);
            setEndDate(dates[1]);
        }
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
        <div>
            <RangePicker
                showTime
                format="YYYY-MM-DD"
                onChange={handleRangeChange}
                value={startDate && endDate ? [startDate, endDate] : null}
            />
            <Schedulant end={endDate}
                        start={startDate}
                        editable={true}
                        selectable={true}
                        lineHeight={40}
                        slotMinWidth={50}
                        schedulantViewType={"Day"}
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
