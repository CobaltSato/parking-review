import React, { useState } from 'react';
import './ParkingSurvey.css';

interface ParkingSurveyProps {
  onClose?: () => void;
}

const ParkingSurvey: React.FC<ParkingSurveyProps> = ({ onClose }) => {
  const [usedParking, setUsedParking] = useState<string>('');
  const [congestion, setCongestion] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!usedParking || !congestion) {
      return;
    }
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="parking-survey-overlay" onClick={handleSkip}>
        <div className="parking-survey-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="survey-title">カフェ・ド・パリの駐車場について教えてください</h2>

          <div className="survey-question">
            <p className="question-text">カフェ・ド・パリの駐車場を利用しましたか?</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="usedParking"
                  value="used"
                  checked={usedParking === 'used'}
                  onChange={(e) => setUsedParking(e.target.value)}
                />
                <span className="radio-label">利用した</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="usedParking"
                  value="notUsed"
                  checked={usedParking === 'notUsed'}
                  onChange={(e) => setUsedParking(e.target.value)}
                />
                <span className="radio-label">利用していない</span>
              </label>
            </div>
          </div>

          <div className="survey-question">
            <p className="question-text">今の駐車場の混雑状況はどうでしたか?</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="empty"
                  checked={congestion === 'empty'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">空いている</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="slightlyEmpty"
                  checked={congestion === 'slightlyEmpty'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">やや空いている</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="normal"
                  checked={congestion === 'normal'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">普通</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="slightlyCrowded"
                  checked={congestion === 'slightlyCrowded'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">やや混雑</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="veryCrowded"
                  checked={congestion === 'veryCrowded'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">かなり混雑</span>
              </label>
            </div>
          </div>

          <div className="survey-actions">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!usedParking || !congestion}
            >
              送信
            </button>
            <button className="skip-link" onClick={handleSkip}>
              今回は評価しない
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleCloseSuccess}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#4CAF50" />
                <path
                  d="M16 24L22 30L32 18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="success-message">ご協力ありがとうございます。</p>
            <p className="success-message">10 JPYCを付与しました。</p>
            <p className="success-message">あなたの回答は、次の人の判断に使われます。</p>
            <button className="close-button" onClick={handleCloseSuccess}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingSurvey;


