import type {Milestone} from "schedulant";
import dayjs from "dayjs";

export const mockMilestones: Array<Milestone> = [
    {
        id: "1",
        title: "milestone1",
        time: dayjs("2026-03-31"),
        status: "Success",
        resourceId: "8638818878966724025",
    }
]