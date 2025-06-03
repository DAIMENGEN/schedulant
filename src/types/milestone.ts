import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import type {Dictionary} from "@schedulant/types/base.ts";

export type MilestoneStatus = "Success" | "Failure" | "Warning";

export type Milestone = {
    id: string;
    time: Dayjs;
    title: string;
    status: MilestoneStatus;
    resourceId: string;
    color?: string;
    tooltip?: ReactNode;
    extendedProps?: Dictionary;
}