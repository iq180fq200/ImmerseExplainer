import React, { useState } from 'react';
import { ImmerseExplainer } from '@components/ImmerseExplainer';
import { SettingPage } from '@components/setting';

export function App(){
  const [setting, setInSetting] = useState(false);
  const [apiKey, setAPIKey] = useState('');
  const settingPage = <SettingPage setIsInSetting={setInSetting} apiKey={apiKey} setAPIKey={setAPIKey}/>
  const explainerPage = <ImmerseExplainer setIsInSetting={setInSetting}/>

  return (
    <div>
      {setting ? settingPage : explainerPage}
     </div>
  );
}