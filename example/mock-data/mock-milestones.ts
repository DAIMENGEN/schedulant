import type {Milestone} from "schedulant/dist/types/milestone";
import dayjs from "dayjs";

export const mockMilestones: Array<Milestone> = [
    {
        id: "1",
        title: "milestone1",
        time: dayjs("2024-08-31"),
        status: "Success",
        resourceId: "8638818878966724025",
    }
]