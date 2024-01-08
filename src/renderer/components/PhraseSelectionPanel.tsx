import {
  CloseOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import translateIcon from '@assets/icons/google-translate.png'
import React from 'react'
import './ImmerseExplainer.css'
import {Alert} from 'antd';
import { logger } from '@main/logger';

export interface PhraseSelectionPanelProps {
  selectedWordsIdx: number[]
  setSelectedWordsIdx: any
  context: string
  handleExplain: any
  handleTranslate: any
}
function _PhraseSelectionPanel(props: PhraseSelectionPanelProps) {
  const context = props.context.replace(/[.,;:!?-]/g, (match) => " " + match);
  logger.info(context)
  const allWords = context.split(" ")
  const [alertMassage, setAlertMassage] = React.useState<string>("")
  function handleRemoveWordFromPhrase(wordIdx: number) {
      props.setSelectedWordsIdx(
        props.selectedWordsIdx.filter((w: number) => w !== wordIdx)
      )
  }

  function handleRemoveAllSelectedWords() {
    props.setSelectedWordsIdx([])
  }

  function handleAddWordToSelectedWords(wordIdx: number) {
      props.setSelectedWordsIdx([
        ...props.selectedWordsIdx,
        wordIdx
      ])
  }

  async function handleSearchSelectedWords() {
    if(props.selectedWordsIdx.length == 0){
      return
    }
    props.handleExplain(props.selectedWordsIdx.map((idx: number) => allWords[idx]).join(' '))
  }

  async function handleTranslateSelectedWords() {
    if(props.selectedWordsIdx.length == 0){
      return
    }
    props.handleTranslate(props.selectedWordsIdx.map((idx: number) => allWords[idx]).join(' '))
  }



  const words = allWords.map((word: string, index) => {
    if (props.selectedWordsIdx.includes(index)) {
      return (
        <div className="word clickable" key = {word + index + "selected"}>
          {word}
          <CloseOutlined onClick={() => handleRemoveWordFromPhrase(index)} />
        </div>
      )
    }
    return (
      <div className="word clickable" key = {word + index + "unselected"} onClick={() => handleAddWordToSelectedWords(index)}>
        {word}
      </div>
    )
  })

  const selectedWordsForCurrentPhrasePanel = (
    <div className={"selected-words-for-current-phrase-panel"}>
      <div className="selected-words">
        {words}
      </div>
      <div className={'selected-word__tools'}>
        <SearchOutlined onClick={handleSearchSelectedWords} className="tool"/>
        <img src={translateIcon} onClick={handleTranslateSelectedWords} className="tool icon clickable" alt={'translate into Mandarin'}/>
        <DeleteOutlined onClick={handleRemoveAllSelectedWords} className="tool"/>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex-column">
        {selectedWordsForCurrentPhrasePanel}
      </div>
      {alertMassage.length!== 0 && <Alert message={alertMassage} type="error" showIcon closable onClose={() => setAlertMassage("")}/>}
    </>
  )
}

export const PhraseSelectionPanel = React.memo(_PhraseSelectionPanel)