import { Button, Checkbox, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import {Select} from 'antd';
import appAPI from '@renderer/rendererContextApi';
import { IPCReply } from '@common/IPCReply';

const NEW_DECK_NAME = "+ New Deck Name"
export interface AnkiToolPanelProps {
  handleAddToAnki: any;
}


export function AnkiToolPanel(props: AnkiToolPanelProps) {
  const [deckName, setDeckName] = useState<string>('Immerse Explainer')
  const [includeFillInBlankCard, setIncludeFillInBlankCard] = useState<boolean>(false)
  const [options, setOptions] = useState<{
    value: string;
    label: string;
  }[]>([])
  const [showCreateDeckName, setShowCreateDeckName] = useState<boolean>(false)
  useEffect(() => {
    async function fetchData() {
      try {
        const _decknames = await appAPI.getDeckNames() as IPCReply;
        if (_decknames.status === 200) {
          setOptions([..._decknames.content.map((name: string) => {return {value: name, label: name}}), {value:NEW_DECK_NAME, label: NEW_DECK_NAME}])
        } else {
          console.log(_decknames);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
    fetchData();
  }, [])
  return (
    <div>
      <div className="anki-tool-panel">
        <Select showSearch
                style={{ width: 200 }}
                placeholder="select or input a deck name"
                options={options}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').includes(input)}
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                // mode={"tags"}
                onChange={value => {
                  if (value === NEW_DECK_NAME) {
                    setDeckName('')
                    setShowCreateDeckName(true)
                    console.log("should show modal")
                  } else {
                    setDeckName(value)
                  }
                }}
        />
        <Checkbox onChange={(e) => {setIncludeFillInBlankCard(e.target.checked);}}>Include Cloze Card</Checkbox>
        <Button onClick={() => {props.handleAddToAnki(deckName,includeFillInBlankCard)}}>Add to Anki</Button>
      </div>
      {showCreateDeckName && <CreateDeckNameModal setShowCreateDeckName={setShowCreateDeckName} options={options} setOptions={setOptions}/>}
    </div>
  )
}

interface CreateDeckNameModalProps {
  setShowCreateDeckName: any;
  setOptions: any;
  options: {
    value: string;
    label: string;
  }[];
}

function CreateDeckNameModal(props: CreateDeckNameModalProps) {
  const [newDeckName, setNewDeckName] = useState<string>('')
  const handleOk = () => {
    props.setShowCreateDeckName(false)
    props.setOptions([...props.options, {value:newDeckName, label: newDeckName}])
  }

  const handleCancel = () => {
    props.setShowCreateDeckName(false)
  }
  console.log("modal rendered")

  return (
      <div className={"create-anki-deck"}>
        <input type="text" placeholder="deck name" onChange={(event)=>setNewDeckName(event.target.value)}/>
        <Button onClick={handleOk}>OK</Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </div>
  )
}