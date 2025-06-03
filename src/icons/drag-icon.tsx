import {numberToPixels} from "@schedulant/utils/dom.ts";
import Icon from "@ant-design/icons/lib/components/Icon";

export const DragIcon = (props: { width: number, height: number, color: string }) => {
    const drag = () => (
        <svg className="drag-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${numberToPixels(props.width)}`} height={`${numberToPixels(props.height)}`}>
            <path d="M368 0h32v1024h-32zM496 0h32v1024h-32zM624 0h32v1024h-32z" fill={props.color}></path>
        </svg>
    )
    return <Icon component={drag} {...props}/>
}