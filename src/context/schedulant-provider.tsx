import {type ReactNode, useEffect, useReducer} from "react";
import {SchedulantReducer} from "@schedulant/context/schedulant-reducer.ts";
import {SchedulantContext} from "@schedulant/context/schedulant-context.ts";
import {InitialState, SCHEDULANT_LOCAL_STORAGE_KEY} from "@schedulant/context/schedulant-state.tsx";

export const SchedulantProvider = ({children}: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(SchedulantReducer, undefined, InitialState);

    useEffect(() => {
        localStorage.setItem(SCHEDULANT_LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    return <SchedulantContext.Provider value={{state, dispatch}}>{children}</SchedulantContext.Provider>;
};