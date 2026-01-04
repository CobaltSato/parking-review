import React, { useEffect, useState } from 'react';

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
import ParkingSurvey from './components/ParkingSurvey';

import './App.css';

const sampleExpirationDate = new Date(Date.UTC(2025, 11, 11, 18, 51)); // Note: Month is zero-based
const SHOW_EXAMPLES =
  process.env.REACT_APP_DIMO_SHOW_EXAMPLE !== 'false';

function App() {
  const permissionsEnabled = true;
  const forceEmail = false;
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
        <h1 className="app-title">Parking Review</h1>
        <LoginScreen />
        <UserData />
        <ParkingFeedbackFlow />
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

const LoginScreen = () => {
  const { isAuthenticated } = useDimoAuthState();
  const [loginError, setLoginError] = useState<string | null>(null);

  if (isAuthenticated) return null;

  const handleLoginSuccess = () => {
    setLoginError(null);
  };

  const handleLoginError = (error: unknown) => {
    console.error('Login error:', error);
    setLoginError('ログインに失敗しました。もう一度お試しください。');
  };

  return (
    <div className="login-screen">
      <LoginWithDimo
        mode={DimoSDKModes.POPUP}
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
      {loginError && (
        <div className="error-message">{loginError}</div>
      )}
    </div>
  );
};

const UserData = () => {
  const { isAuthenticated, walletAddress } = useDimoAuthState();
  const [copied, setCopied] = useState(false);
  
  if (!isAuthenticated) return null;
  
  const truncatedWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const polygonScanUrl = walletAddress 
    ? `https://polygonscan.com/address/${walletAddress}`
    : '';

  const handlePolygonScanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (polygonScanUrl) {
      window.open(polygonScanUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="user-data">
      <div className="user-info-card">
        {walletAddress && (
          <div className="user-info-row">
            <div className="user-info-icon">👛</div>
            <div className="user-info-content">
              <div className="user-info-label">ウォレットアドレス</div>
              <div 
                className={`user-info-value wallet ${copied ? 'copied' : ''}`}
                onClick={handleCopyWallet}
                title="クリックでコピー"
              >
                {truncatedWallet}
                <span className="copy-icon">{copied ? '✓' : '📋'}</span>
              </div>
              <a
                href={polygonScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="polygonscan-link"
                onClick={handlePolygonScanClick}
                title="PolygonScanで開く"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                PolygonScan
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ParkingFeedbackFlow = () => {
  const { isAuthenticated } = useDimoAuthState();
  const [showSurvey, setShowSurvey] = useState(false);

  // ログイン後にアンケートを表示
  useEffect(() => {
    if (isAuthenticated) {
      setShowSurvey(true);
    } else {
      setShowSurvey(false);
    }
  }, [isAuthenticated]);

  const handleSurveyClose = () => {
    setShowSurvey(false);
  };

  if (!isAuthenticated) return null;

  if (showSurvey) {
    return <ParkingSurvey onClose={handleSurveyClose} />;
  }

  return null;
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
