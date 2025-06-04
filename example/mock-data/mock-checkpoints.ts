import type {Checkpoint} from "schedulant";
import dayjs from "dayjs";

export const mockCheckpoints: Array<Checkpoint> = [
    {
        id: "1",
        title: "Test Condition Monitor",
        color: "green",
        time: dayjs("2024-09-05"),
        resourceId: "8056891328444594143",
    },
]