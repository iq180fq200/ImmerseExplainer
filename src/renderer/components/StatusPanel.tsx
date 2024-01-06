import React from 'react'
import './ImmerseExplainer.css'

export interface StatusPanelProps {
  status: string
}
function _StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className="status-panel">
      <hr className="line"/>
      <div className="status-panel__status">{status}</div>
    </div>
  )
}

export const StatusPanel = React.memo(_StatusPanel)
