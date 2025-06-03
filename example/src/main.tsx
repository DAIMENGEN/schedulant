import {StrictMode} from "react"
import {Schedulant} from "schedulant";
import {createRoot} from "react-dom/client"
import dayjs from "dayjs";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <div>
            <Schedulant end={dayjs("2025-01-01").add(1, "year")}
                        start={dayjs("2025-01-01")}
                        editable={true}
                        selectable={true}
                        lineHeight={30}
                        slotMinWidth={100}
                        schedulantMaxHeight={500}
                        events={[]}
                        resources={[]}/>
        </div>
    </StrictMode>,
)
