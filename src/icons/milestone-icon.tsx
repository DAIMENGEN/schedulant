import Icon from "@ant-design/icons/lib/components/Icon";
import {numberToPixels} from "@schedulant/utils/dom.ts";

export const MilestoneIcon = (props: { width: number, height: number, color: string }) => {
    const milestone = () => (
        <svg className="milestone-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${numberToPixels(props.width)}`} height={`${numberToPixels(props.height)}`}>
            <path
                d="M156 64v896l356-280 356 280V64H156z m511.8 556.4L512 538.5l-155.7 81.9L386 447 260 324.2l174.1-25.3L512 141.1l77.9 157.8L764 324.2 638 447l29.8 173.4z"
                fill={props.color}></path>
        </svg>
    )
    return <Icon component={milestone} {...props}/>
}
