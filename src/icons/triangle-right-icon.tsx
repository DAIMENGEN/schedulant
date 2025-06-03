import Icon from "@ant-design/icons/lib/components/Icon";
import {numberToPixels} from "@schedulant/utils/dom.ts";

export const TriangleRightIcon = (props: { width: number, height: number, color: string }) => {
    const triangle = () => (
        <svg className="triangle-left-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${numberToPixels(props.width)}`} height={`${numberToPixels(props.height)}`}>
            <path
                d="M258.467 115.367c0-46.168 61.65-75.692 97.005-40.324l397.396 397.396c22.791 22.791 22.791 56.687 0 79.477L355.472 989.779c-34.469 34.481-97.006 7.598-97.006-39.74V115.367z"
                fill={props.color}></path>
        </svg>
    )
    return <Icon component={triangle} {...props}/>
}