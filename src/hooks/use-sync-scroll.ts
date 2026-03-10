import {type RefObject, useEffect} from "react";

/**
 * Unified scroll sync for the schedulant layout.
 *
 * - bodyRight is the single vertical scroll source (bodyLeft has overflow-y: hidden).
 * - Wheel events are intercepted for zero-lag sync on all pairs.
 * - Scroll event handlers serve as fallback for scrollbar drag / touch / programmatic scroll.
 */
export const useScrollSync = (
    bodyLeft: RefObject<HTMLDivElement | null>,
    bodyRight: RefObject<HTMLDivElement | null>,
    headerLeft: RefObject<HTMLDivElement | null>,
    headerRight: RefObject<HTMLDivElement | null>,
) => {
    useEffect(() => {
        const bl = bodyLeft.current;
        const br = bodyRight.current;
        const hl = headerLeft.current;
        const hr = headerRight.current;
        if (!bl || !br || !hl || !hr) return;

        const cleanups: (() => void)[] = [];
        const on = (
            el: HTMLElement,
            evt: string,
            fn: EventListener,
            opts?: AddEventListenerOptions,
        ) => {
            el.addEventListener(evt, fn, opts);
            cleanups.push(() => el.removeEventListener(evt, fn));
        };

        // --- Scroll event handlers (fallback for scrollbar drag, touch, programmatic) ---

        // bodyRight scroll → sync bodyLeft vertically + headerRight horizontally
        on(br, 'scroll', () => {
            bl.scrollTop = br.scrollTop;
            hr.scrollLeft = br.scrollLeft;
        });

        // bodyLeft scroll → sync headerLeft horizontally
        on(bl, 'scroll', () => {
            hl.scrollLeft = bl.scrollLeft;
        });

        // --- Wheel handlers for zero-lag sync ---

        // Wheel on bodyLeft:
        //  deltaY → forward to bodyRight (bodyLeft has overflow-y: hidden)
        //  deltaX → predict headerLeft position for zero-lag
        on(bl, 'wheel', ((e: WheelEvent) => {
            let shouldPrevent = false;

            if (e.deltaY !== 0) {
                const maxTop = br.scrollHeight - br.clientHeight;
                const newTop = Math.max(0, Math.min(maxTop, br.scrollTop + e.deltaY));
                br.scrollTop = newTop;
                bl.scrollTop = newTop;
                shouldPrevent = true;
            }

            if (shouldPrevent && e.deltaX !== 0) {
                // Diagonal scroll: since we preventDefault, also handle horizontal manually
                const maxLeft = bl.scrollWidth - bl.clientWidth;
                const newLeft = Math.max(0, Math.min(maxLeft, bl.scrollLeft + e.deltaX));
                bl.scrollLeft = newLeft;
                hl.scrollLeft = newLeft;
            } else if (e.deltaX !== 0) {
                // Pure horizontal: let native handle bodyLeft, predict headerLeft
                const maxLeft = bl.scrollWidth - bl.clientWidth;
                hl.scrollLeft = Math.max(0, Math.min(maxLeft, bl.scrollLeft + e.deltaX));
            }

            if (shouldPrevent) e.preventDefault();
        }) as EventListener, {passive: false});

        // Wheel on bodyRight: preventDefault + manually set both scrollTops for zero-lag
        on(br, 'wheel', ((e: WheelEvent) => {
            let shouldPrevent = false;

            if (e.deltaY !== 0) {
                const maxTop = br.scrollHeight - br.clientHeight;
                const newTop = Math.max(0, Math.min(maxTop, br.scrollTop + e.deltaY));
                br.scrollTop = newTop;
                bl.scrollTop = newTop;
                shouldPrevent = true;
            }

            if (e.deltaX !== 0) {
                const maxLeft = br.scrollWidth - br.clientWidth;
                const newLeft = Math.max(0, Math.min(maxLeft, br.scrollLeft + e.deltaX));
                br.scrollLeft = newLeft;
                hr.scrollLeft = newLeft;
                shouldPrevent = true;
            }

            if (shouldPrevent) e.preventDefault();
        }) as EventListener, {passive: false});

        return () => cleanups.forEach(fn => fn());
    }, [bodyLeft, bodyRight, headerLeft, headerRight]);
};