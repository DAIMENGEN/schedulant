import {Flex, Splitter, Typography} from "antd";
import {SchedulantProvider} from "@schedulant/context/schedulant-provider.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";

export const Schedulant = () => {
    return (
        <SchedulantProvider>
            <Main/>
        </SchedulantProvider>
    )
}

const Main = () => {
    const {state, dispatch} = useSchedulantContext();
    return (
        <div className={"schedulant"}>
            <Splitter onResizeEnd={(size) => {
                dispatch({
                    type: "SET_RESOURCE_AREA_WIDTH",
                    width: size[0],
                });
            }}>
                <Splitter.Panel defaultSize={state.resourceAreaWidth}>
                    <Flex justify="center" align="center" style={{height: '100%'}}>
                        <Typography.Title type="secondary" level={5} style={{whiteSpace: 'nowrap'}}>
                            First Panel
                        </Typography.Title>
                    </Flex>
                </Splitter.Panel>
                <Splitter.Panel>
                    <Flex justify="center" align="center" style={{height: '100%'}}>
                        <Typography.Title type="secondary" level={5} style={{whiteSpace: 'nowrap'}}>
                            Second Panel
                        </Typography.Title>
                    </Flex>
                </Splitter.Panel>
            </Splitter>
        </div>
    )
}