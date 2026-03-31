import ReactDOM from 'react-dom/client';
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from '@cometchat/chat-uikit-react';
import React from 'react';
import App from 'App';
import { setupLocalization } from 'CometChat/utils/utils';
import cometChatLogo from '../src/CometChat/assets/cometchat_logo.svg';
import { CometChatProvider } from 'CometChat/context/CometChatContext';

function readEnv(value: string | undefined) {
  const normalizedValue = value?.trim() ?? ''

  if (
    !normalizedValue ||
    normalizedValue.startsWith('YOUR_') ||
    normalizedValue.startsWith('REPLACE_') ||
    normalizedValue === 'UID'
  ) {
    return ''
  }

  return normalizedValue
}

export const COMETCHAT_CONSTANTS = {
  APP_ID: readEnv(import.meta.env.VITE_COMETCHAT_APP_ID),
  REGION: readEnv(import.meta.env.VITE_COMETCHAT_REGION),
  AUTH_KEY: readEnv(import.meta.env.VITE_COMETCHAT_AUTH_KEY),
};

if (
  COMETCHAT_CONSTANTS.APP_ID &&
  COMETCHAT_CONSTANTS.REGION &&
  COMETCHAT_CONSTANTS.AUTH_KEY
) {
  const uiKitSettings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();

  CometChatUIKit.init(uiKitSettings)?.then(() => {
    setupLocalization();
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    root.render(
      <CometChatProvider>
        <App />
      </CometChatProvider>
    );
  });
} else {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <div className="App" style={{ gap: '20px' }}>
      <div className="cometchat-credentials__logo">
        <img src={cometChatLogo} alt="CometChat Logo" />
      </div>
      <div className="cometchat-credentials__header">
        CometChat App credentials are missing. Please add them in <code>.env</code> to continue.
      </div>
    </div>
  );
}
