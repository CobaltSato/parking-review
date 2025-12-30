import React, { useState } from 'react';

import {
  DimoSDKModes,
  ExecuteAdvancedTransactionWithDimo,
  initializeDimoSDK,
  LoginWithDimo,
  LogoutWithDimo,
  Permissions,
  ShareVehiclesWithDimo,
  useDimoAuthState,
} from '@dimo-network/login-with-dimo';

import { sampleAbi } from './abi/sample-abi';

import './App.css';

const sampleExpirationDate = new Date(Date.UTC(2025, 11, 11, 18, 51)); // Note: Month is zero-based
const SHOW_EXAMPLES =
  process.env.REACT_APP_DIMO_SHOW_EXAMPLE !== 'false';

function App() {
  const [permissionsEnabled, setPermissionsEnabled] = useState(true);
  const [forceEmail, setForceEmail] = useState(true);
  initializeDimoSDK({
    clientId: process.env.REACT_APP_DIMO_CLIENT_ID!,
    redirectUri: process.env.REACT_APP_DIMO_REDIRECT_URI!,
    environment: process.env.REACT_APP_DIMO_ENV! as
      | 'production'
      | 'development',
    apiKey: process.env.REACT_APP_DIMO_API_KEY!,
    options: {
      forceEmail,
    },
  });

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Testing Dimo Login Button</h1>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={permissionsEnabled}
              onChange={() => setPermissionsEnabled(!permissionsEnabled)}
            />
            Enable Vehicle Manager as entry state
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={forceEmail}
              onChange={() => setForceEmail(!forceEmail)}
            />
            Force Email
          </label>
        </div>
        <UserData />
        {SHOW_EXAMPLES && (
          <>
            <Examples
              loginType={DimoSDKModes.POPUP}
              permissionsEnabled={permissionsEnabled}
            />
            <Examples
              loginType={DimoSDKModes.REDIRECT}
              permissionsEnabled={permissionsEnabled}
            />
          </>
        )}
      </header>
    </div>
  );
}

interface Props {
  loginType: DimoSDKModes;
  permissionsEnabled?: boolean;
}

const UserData = () => {
  const { isAuthenticated, email, walletAddress } = useDimoAuthState();
  if (!isAuthenticated) return null;
  return (
    <div className="user-data">
      <h3>Connected User</h3>
      {walletAddress && (
        <div className="user-info-item">
          <span className="user-label">Wallet Address:</span>
          <span className="user-value">{walletAddress}</span>
        </div>
      )}
      {email && (
        <div className="user-info-item">
          <span className="user-label">Email:</span>
          <span className="user-value">{email}</span>
        </div>
      )}
      {!email && (
        <div className="user-info-item">
          <span className="user-label">Email:</span>
          <span className="user-value no-email">メールアドレスが取得できませんでした</span>
        </div>
      )}
    </div>
  );
};

const Examples = (props: Props) => {
  const { loginType, permissionsEnabled } = props;
  const onSuccess = (data: unknown) => console.log('Success:', data);
  const onError = (error: unknown) => console.log('Error:', error);
  const { isAuthenticated } = useDimoAuthState();

  return (
    <div>
      <h3>
        {loginType === DimoSDKModes.POPUP ? 'Popup' : 'Redirect'} Examples
      </h3>
      <LoginWithDimo
        mode={loginType}
        onSuccess={onSuccess}
        onError={onError}
        permissionTemplateId={permissionsEnabled ? '1' : undefined}
        utm="dimo"
      />
      {isAuthenticated && (
        <>
          <ShareVehiclesWithDimo
            mode={loginType}
            onSuccess={onSuccess}
            onError={onError}
            permissions={[
              Permissions.GetNonLocationHistory,
              Permissions.GetCurrentLocation,
              Permissions.GetLocationHistory,
              Permissions.GetVINCredential,
              Permissions.GetLiveData,
            ]}
            expirationDate={sampleExpirationDate.toISOString()}
          />
          <ShareVehiclesWithDimo
            mode={loginType}
            onSuccess={onSuccess}
            onError={onError}
            authenticatedLabel={'Connect a Tesla'}
            permissionTemplateId={'2'}
            onboarding={['tesla']}
          />
          <ShareVehiclesWithDimo
            mode={loginType}
            onSuccess={onSuccess}
            onError={onError}
            authenticatedLabel={'Share ICE vehicles only'}
            permissionTemplateId={'2'}
            powertrainTypes={['ICE']}
          />
          <ShareVehiclesWithDimo
            mode={loginType}
            onSuccess={onSuccess}
            onError={onError}
            authenticatedLabel={'Share BEV vehicles only'}
            permissionTemplateId={'2'}
            powertrainTypes={['BEV']}
          />
          <AdvancedTransactionButton loginType={loginType} />
          <LogoutWithDimo
            mode={loginType}
            onSuccess={onSuccess}
            onError={onError}
          />
        </>
      )}
    </div>
  );
};

const AdvancedTransactionButton = (props: Pick<Props, 'loginType'>) => {
  const onSuccess = (data: any) => {
    console.log(data);
    console.log('Transaction Hash:', data.transactionHash);
  };
  const onError = (error: unknown) => console.error('Error:', error);
  return (
    <ExecuteAdvancedTransactionWithDimo
      mode={props.loginType}
      onSuccess={onSuccess}
      onError={onError}
      address="0x21cFE003997fB7c2B3cfe5cf71e7833B7B2eCe10"
      abi={sampleAbi}
      functionName="transfer"
      args={['0x62b98e019e0d3e4A1Ad8C786202e09017Bd995e1', '0']}
    />
  );
};

export default App;
