import { Button, Input, message } from 'antd';
import React from 'react';
import appAPI from '@renderer/rendererContextApi';
import { EnterOutlined } from '@ant-design/icons';
import './setting.css'

export interface SettingProps {
  setIsInSetting: any
  apiKey: string,
  setAPIKey: any
}
export function SettingPage (props: SettingProps) {
  // the reference of the input element
  const inputRef = React.useRef(null);
  const [apiKeyInput, setAPIKeyInput] = React.useState<string>(props.apiKey)

  const handleSetOpenAIAPIKey = async () => {
    if (inputRef.current?.input.value) {
      // do something
      const api = apiKeyInput
      props.setAPIKey(api)
      const reply = await appAPI.setOpenAIKey(api)
      if (reply.status === 200) {
        message.info('Set OpenAI API key successfully')
      }
      else {
        message.error('Set OpenAI API key failed')
      }
    }
    // focus the input element
  }
  const openAIAPIKey = <>
    <Input placeholder="Input your openAI key here" ref={inputRef} value={apiKeyInput} onChange={(e) => {setAPIKeyInput(e.target.value)}}/>
    <Button type="primary" onClick={() => handleSetOpenAIAPIKey()}>Submit</Button>
  </>
  return (
    <div className="setting-page">
      <div className="return" onClick={() => props.setIsInSetting(false)}>
        <EnterOutlined/> Return
      </div>
      {openAIAPIKey}
    </div>
  )
}