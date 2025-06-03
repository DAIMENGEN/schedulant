import {useContext} from "react";
import {SchedulantContext} from "@schedulant/context/schedulant-context.ts";

export const useSchedulantContext = () => {
    const context = useContext(SchedulantContext);
    if (context === undefined) {
        throw new Error("useSchedulantContext must be used within a SchedulantProvider");
    }
    return context;
};