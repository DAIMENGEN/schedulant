import type {Dayjs} from "dayjs";
import type {Event} from "@schedulant/types/event.ts";
import type {Resource} from "@schedulant/types/resource.ts";
import type {Milestone} from "@schedulant/types/milestone.ts";
import type {Checkpoint} from "@schedulant/types/checkpoint.ts";

export type SchedulantProps = {
    end: Dayjs,
    start: Dayjs,
    editable: boolean;
    selectable: boolean;
    lineHeight: number;
    slotMinWidth: number;
    schedulantMaxHeight: number;
    events: Event[];
    resources: Resource[];
    milestones?: Milestone[];
    checkpoints?: Checkpoint[];
    companyHolidays?: Dayjs[];
    specialWorkdays?: Dayjs[];
    nationalHolidays?: Dayjs[];
    defaultEmptyLanes?: number;
    resourceAreaWidth?: string;
}