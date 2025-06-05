import type {Dayjs} from "dayjs";

export const TimelineColgroup = (props: {
    dates: Dayjs[],
    minWidth: number
}) => {
    const {dates, minWidth} = props;
    return (
        <colgroup>
            {
                dates.map(date => <col key={date.format("YYYY-MM-DD")} style={{minWidth: minWidth}}/>)
            }
        </colgroup>
    )
}