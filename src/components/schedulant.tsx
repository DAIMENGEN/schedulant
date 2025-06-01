import {Flex, Splitter, Typography} from "antd";

export const Schedulant = () => {
  return (
    <div className={"schedulant"}>
        <Splitter>
            <Splitter.Panel defaultSize="30%" min="10%" max="50%">
                <Flex justify="center" align="center" style={{ height: '100%' }}>
                    <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
                        First Panel
                    </Typography.Title>
                </Flex>
            </Splitter.Panel>
             <Splitter.Panel>
                <Flex justify="center" align="center" style={{ height: '100%' }}>
                    <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
                        Second Panel
                    </Typography.Title>
                </Flex>
            </Splitter.Panel>
        </Splitter>
    </div>
  )
}