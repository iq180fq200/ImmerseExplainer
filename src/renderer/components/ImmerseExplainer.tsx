import { Input, message } from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  SoundOutlined,
  SettingOutlined
} from '@ant-design/icons'
import React, { useEffect, useState } from 'react';
import { StatusPanel } from './StatusPanel'
import { PhraseSelectionPanel } from './PhraseSelectionPanel'
import './ImmerseExplainer.css'
import { IPCReply } from '@common/IPCReply';
import appAPI from '@renderer/rendererContextApi';
import { AnkiToolPanel } from '@components/AnkiToolPanel';

const { TextArea } = Input

export interface ImmerseExplainerProps {
  setIsInSetting: any
}

export function ImmerseExplainer(props: ImmerseExplainerProps) {
  const [context, setContext] = useState('')
  const [selectedWordsIdx, setSelectedWordsIdx] = useState<number[]>([])
  const [explanation, setExplanation] = useState<string>('')
  const [status, setStatus] = useState<string>('Enter context and select phrases you want to explain')
  // const [audioFilePath, setAudioFilePath] = useState<string>('')

  useEffect(() => {
    const callback = (context: string) => {
      setContext(context);
      setSelectedWordsIdx([])
    };

    appAPI.listenClipPopContext(callback);

    // Cleanup function
    return () => {
      // Remove the event listener
      appAPI.unlistenClipPopContext();
    };
  }, []); // Empty dependency array ensures this runs once on mount and once on unmount

  async function handleExplain(QueryPhrase: string){
    if (context.length > 0) {
      setStatus('explaining')
      try {
        const _explanation = (await appAPI.explain(
          context,
          [QueryPhrase]
        )) as IPCReply
        if (_explanation.status === 200) {
          setStatus('explained')
          setExplanation(_explanation.content)
        } else {
          setStatus('error')
          // setExplanation((_explanation.content as BackendError).message)
          setExplanation(_explanation.content)
          console.log(_explanation)
        }
      } catch (e) {
        // catch other errors like IPC errors
        setStatus('error')
        setExplanation(e)
        console.log(e)
      }
    }
  }

  async function handleAddToAnki(deckName: string, includeFillInBlankCard: boolean){
    if (context.length && explanation.length > 0) {
      try{
        const result = await appAPI.addToAnki(context.replace(/([.,;:!?-]) /g, (match) => " " + match), selectedWordsIdx, explanation,deckName,includeFillInBlankCard) as IPCReply
        // TODO: if audioFilePath is null, get the audio
        if (result.status === 200) {
          message.info("Added to Anki")
        } else {
          message.error("Failed to add to Anki" + result.content)
          console.log(result)
        }
      }
      catch(e){
        message.error("Failed to add to Anki" + e)
        console.log(e)
      }

    }

  }

  async function handleTranslate(QueryPhrase: string){
    if (context.length > 0) {
      setStatus('Translating to Chinese')
      try {
        const _translation = (await appAPI.translate(
          QueryPhrase.length > 0?QueryPhrase:context
        )) as IPCReply
        if (_translation.status === 200) {
          setStatus('translated')
          setExplanation(_translation.content)
        } else {
          setStatus('error')
          // setExplanation((_explanation.content as BackendError).message)
          setExplanation(_translation.content)
        }
      } catch (e) {
        // catch other errors like IPC errors
        setStatus('error')
        setExplanation(e)
      }
    }
  }

  function handleContextChange(e: any) {
    setSelectedWordsIdx([])
    setContext(e.target.value)
  }

  async function handleSound() {}

  async function handleCopy() {
    appAPI.copyToClipboard(context)
  }

  function handleDeleteContext() {
    setSelectedWordsIdx([])
    setContext('')
  }

  const headerBar = (
    <div className="header-bar">
      <div className="header-bar__title">Immerse Explainer</div>
    </div>
  )

  const contextPanel = (
    <div className="context-panel">
      <TextArea
        rows={4}
        onChange={handleContextChange}
        className="textArea"
        value = {context}
      />
      <div className="context-panel-tools">
        {/*<SoundOutlined onClick={handleSound} className="tool"/>*/}
        <CopyOutlined onClick={handleCopy} className="tool"/>
        <DeleteOutlined onClick={handleDeleteContext} className="tool"/>
      </div>
    </div>
  )

  const phraseSelectionPanel = <PhraseSelectionPanel selectedWordsIdx={selectedWordsIdx} setSelectedWordsIdx={setSelectedWordsIdx} context={context}  handleExplain={handleExplain} handleTranslate={handleTranslate}/>
  const statusPanel = <StatusPanel status={status} />

  const resultPanel = <div className="result-panel">{explanation}</div>

  const ankiToolPanel = <AnkiToolPanel handleAddToAnki={handleAddToAnki}/>

  const footPanel = <div className="footer"><SettingOutlined onClick={() => props.setIsInSetting(true)}/></div>

  return (
    <div className="immerse-explainer">
      {headerBar}
      {contextPanel}
      {phraseSelectionPanel}
      {statusPanel}
      {explanation.length > 0 && resultPanel}
      {footPanel}
      {explanation.length > 0 && ankiToolPanel}
    </div>
  )
}
