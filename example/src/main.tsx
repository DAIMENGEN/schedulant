import dayjs from "dayjs";
import {StrictMode} from "react"
import {Schedulant, type SelectInfoArg} from "schedulant";
import {createRoot} from "react-dom/client"
import {mockResources} from "../mock-data/mock-resources.ts";
import {mockEvents} from "../mock-data/mock-events.tsx";
import {mockCheckpoints} from "../mock-data/mock-checkpoints.ts";
import {mockMilestones} from "../mock-data/mock-milestones.ts";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import "schedulant/dist/schedulant.css";

dayjs.extend(isSameOrBefore);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <div>
            <Schedulant end={dayjs("2024-09-09")}
                        start={dayjs("2024-08-10")}
                        editable={true}
                        selectable={true}
                        lineHeight={40}
                        slotMinWidth={50}
                        defaultEmptyLanes={10}
                        schedulantViewType={"Day"}
                        schedulantMaxHeight={1000}
                        resources={mockResources}
                        events={mockEvents}
                        checkpoints={mockCheckpoints}
                        milestones={mockMilestones}
                        resourceAreaColumns={[
                            {
                                field: "title",
                                headerContent: "Title",
                            },
                            {
                                field: "order",
                                headerContent: "Order",
                            },
                            {
                                field: "parentId",
                                headerContent: "Parent",
                            }
                        ]}
                        eventMove={(eventMoveMountArg) => {
                            console.log(eventMoveMountArg.startDate.format("YYYY-MM-DD"));
                            console.log(eventMoveMountArg.endDate.format("YYYY-MM-DD"));
                        }}
                        eventResizeStart={(eventResizeMountArg) => {
                            console.log(eventResizeMountArg.date.format("YYYY-MM-DD"));
                        }}
                        eventResizeEnd={(eventResizeMountArg) => {
                            console.log(eventResizeMountArg.date.format("YYYY-MM-DD"));
                        }}
                        selectAllow={(arg: SelectInfoArg) => {
                            console.log("resourceTitle: ", arg.resourceApi.getTitle());
                            console.log("startDate: ", arg.startDate.format("YYYY-MM-DD"));
                            console.log("endDate: ", arg.endDate.format("YYYY-MM-DD"));
                        }}
            />
        </div>
    </StrictMode>,
)
