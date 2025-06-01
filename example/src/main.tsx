import { StrictMode } from "react"
import {Schedulant} from "schedulant";
import { createRoot } from "react-dom/client"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <div>
          <Schedulant />
      </div>
  </StrictMode>,
)
