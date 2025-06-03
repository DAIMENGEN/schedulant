import {createContext, type Dispatch} from "react";
import type {Action, SchedulantState} from "@schedulant/context/schedulant-state.tsx";

type SchedulantContextType = {
    state: SchedulantState;
    dispatch: Dispatch<Action>;
};

export const SchedulantContext = createContext<SchedulantContextType | undefined>(undefined);
