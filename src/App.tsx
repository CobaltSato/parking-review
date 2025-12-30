import React, { useCallback, useEffect, useState } from 'react';

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

type ParkingSpot = {
  id: string;
  name: string;
  location: string;
  reward?: string;
};

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ParkingFeedbackFlow = () => {
  const { isAuthenticated } = useDimoAuthState();
  const { spot, isLoading } = useMockParkingSpot();
  const [isRatingOpen, setRatingOpen] = useState(false);
  const [isCommentOpen, setCommentOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // ログイン後に評価モーダルを表示
  useEffect(() => {
    if (isAuthenticated && spot && !isLoading) {
      setRatingOpen(true);
    }
  }, [isAuthenticated, spot, isLoading]);

  const handleSubmitRating = useCallback(async () => {
    if (!spot || rating === null) return;
    setIsSubmitting(true);
    await mockSubmitToApi({
      type: 'parking-rating',
      spotId: spot.id,
      rating,
    });
    setIsSubmitting(false);
    setRatingOpen(false);
    setCommentOpen(true);
  }, [rating, spot]);

  const handleSkipRating = useCallback(() => {
    setRatingOpen(false);
  }, []);

  const handleSubmitComment = useCallback(async () => {
    if (!spot) return;
    setIsSubmitting(true);
    await mockSubmitToApi({
      type: 'parking-comment',
      spotId: spot.id,
      comment,
    });
    setIsSubmitting(false);
    setComment('');
    setCommentOpen(false);
    setRewardMessage('フィードバックありがとうございます！');
  }, [comment, spot]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="parking-feedback placeholder-card">
        DIMOから駐車データを取得中...
      </div>
    );
  }

  if (!spot) return null;

  return (
    <div className="parking-feedback">
      {rewardMessage && (
        <div className="reward-banner">{rewardMessage}</div>
      )}
      {isRatingOpen && (
        <ParkingRatingModal
          spot={spot}
          rating={rating}
          onSelect={setRating}
          onSubmit={handleSubmitRating}
          onSkip={handleSkipRating}
          isSubmitting={isSubmitting}
        />
      )}
      {isCommentOpen && (
        <ParkingCommentModal
          spot={spot}
          comment={comment}
          onChangeComment={setComment}
          onSubmit={handleSubmitComment}
          onClose={() => setCommentOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}
      {!isRatingOpen && !isCommentOpen && (
        <button
          className="dimo-button primary"
          onClick={() => {
            setRatingOpen(true);
            setCommentOpen(false);
            setRewardMessage(null);
            setRating(null);
          }}
        >
          フィードバックをもう一度送る
        </button>
      )}
    </div>
  );
};

const ParkingRatingModal = ({
  spot,
  rating,
  onSelect,
  onSubmit,
  onSkip,
  isSubmitting,
}: {
  spot: ParkingSpot;
  rating: number | null;
  onSelect: (value: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}) => (
  <div className="feedback-modal-overlay">
    <div className="feedback-modal">
      <button 
        className="modal-close" 
        onClick={onSkip}
        aria-label="閉じる"
      >
        ×
      </button>
      <div className="modal-header">
        <p>{spot.name}の駐車難易度を教えてください</p>
      </div>
      <StarRating value={rating} onSelect={onSelect} />
      <div className="rating-labels">
        <span>簡単</span>
        <span>難しい</span>
      </div>
      <div className="modal-actions stacked">
        <button
          className="dimo-button primary"
          onClick={onSubmit}
          disabled={rating === null || isSubmitting}
        >
          {isSubmitting ? '送信中...' : '送信する'}
        </button>
        <button className="dimo-button secondary" onClick={onSkip}>
          この評価はスキップする
        </button>
      </div>
    </div>
  </div>
);

const ParkingCommentModal = ({
  spot,
  comment,
  onChangeComment,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  spot: ParkingSpot;
  comment: string;
  onChangeComment: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}) => (
  <div className="feedback-modal-overlay">
    <div className="feedback-modal">
      <button 
        className="modal-close" 
        onClick={onClose}
        aria-label="閉じる"
      >
        ×
      </button>
      <div className="modal-header">
        <p>コメント（任意）</p>
      </div>
      <textarea
        className="comment-input"
        rows={4}
        placeholder={`${spot.name}の印象や注意点などをご自由にどうぞ`}
        value={comment}
        onChange={(event) => onChangeComment(event.target.value)}
      />
      <div className="modal-actions">
        <button
          className="dimo-button primary"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '送信中...' : '送信する'}
        </button>
      </div>
      <p className="comment-hint">
        コメントを送信いただくと抽選でさらに100JPYCが当たります
      </p>
    </div>
  </div>
);

const StarRating = ({
  value,
  onSelect,
}: {
  value: number | null;
  onSelect: (star: number) => void;
}) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${value !== null && star <= value ? 'filled' : ''}`}
        onClick={() => onSelect(star)}
      >
        ★
      </button>
    ))}
  </div>
);

// DIMOから駐車データを取得する（Mock）
const useMockParkingSpot = () => {
  const { isAuthenticated } = useDimoAuthState();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // DIMO APIから駐車データを取得する（Mock実装）
    const fetchParkingData = async () => {
      // 実際の実装では、DIMO APIを呼び出して駐車データを取得
      // 例: const response = await fetch('/api/dimo/parking-spots', { headers: { Authorization: `Bearer ${token}` } });
      
      // Mock: DIMOから取得した駐車データをシミュレート
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSpot({
        id: 'mock-spot-001',
        name: '渋谷地下駐車場',
        location: '東京都渋谷区渋谷2-21-1',
        reward: '20JPYC',
      });
      setIsLoading(false);
    };

    fetchParkingData();
  }, [isAuthenticated]);

  return { spot, isLoading };
};

// DIMO APIに駐車フィードバックを送信する（Mock）
const mockSubmitToApi = async (payload: Record<string, unknown>) => {
  // 実際の実装では、DIMO APIに送信
  // 例: await fetch('/api/dimo/parking-feedback', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ spotId: payload.spotId, ...payload })
  // });
  
  console.log('DIMO API送信（Mock）:', {
    endpoint: '/api/dimo/parking-feedback',
    payload: {
      spotId: payload.spotId,
      spotName: payload.type === 'parking-rating' || payload.type === 'parking-comment' 
        ? '渋谷地下駐車場' 
        : undefined,
      location: '東京都渋谷区渋谷2-21-1',
      ...payload,
    },
  });
  
  await new Promise(resolve => setTimeout(resolve, 900));
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
