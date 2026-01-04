import React, { useState } from 'react';
import './ParkingSurvey.css';

interface ParkingSurveyProps {
  onClose?: () => void;
}

const ParkingSurvey: React.FC<ParkingSurveyProps> = ({ onClose }) => {
  const [usedParking, setUsedParking] = useState<string>('');
  const [congestion, setCongestion] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const newPreviews: string[] = [];
    let loadedCount = 0;

    if (newFiles.length === 0) return;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setImages((prev) => [...prev, ...newFiles]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="parking-survey-overlay" onClick={handleSkip}>
        <div className="parking-survey-modal" onClick={(e) => e.stopPropagation()}>
          <div className="survey-question">
            <p className="question-text">Did you use the parking lot?</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="usedParking"
                  value="used"
                  checked={usedParking === 'used'}
                  onChange={(e) => setUsedParking(e.target.value)}
                />
                <span className="radio-label">Yes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="usedParking"
                  value="notUsed"
                  checked={usedParking === 'notUsed'}
                  onChange={(e) => setUsedParking(e.target.value)}
                />
                <span className="radio-label">No</span>
              </label>
            </div>
          </div>

          <div className="survey-question">
            <p className="question-text">How was the congestion?</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="empty"
                  checked={congestion === 'empty'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">Empty</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="slightlyEmpty"
                  checked={congestion === 'slightlyEmpty'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">Slightly empty</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="normal"
                  checked={congestion === 'normal'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">Normal</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="slightlyCrowded"
                  checked={congestion === 'slightlyCrowded'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">Slightly crowded</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="congestion"
                  value="veryCrowded"
                  checked={congestion === 'veryCrowded'}
                  onChange={(e) => setCongestion(e.target.value)}
                />
                <span className="radio-label">Very crowded</span>
              </label>
            </div>
          </div>

          {/* Optional: Comment */}
          <div className="survey-question optional">
            <div className="question-header">
              <p className="question-text">Comment (optional)</p>
              <span className="optional-badge">Optional</span>
            </div>
            <textarea
              className="comment-input"
              placeholder="Enter your comment about the parking lot"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Optional: Image upload */}
          <div className="survey-question optional">
            <div className="question-header">
              <p className="question-text">Photos (optional)</p>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="image-upload-section">
              <label className="image-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Select photos
              </label>
              {imagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => handleRemoveImage(index)}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="survey-actions">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!usedParking || !congestion}
            >
              Submit
            </button>
            <button className="skip-link" onClick={handleSkip}>
              Skip
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
            <p className="success-message">Thank you for your cooperation.</p>
            <p className="success-message">10 JPYC has been awarded.</p>
            <p className="success-message">Your response will be used to help others make decisions.</p>
            <button className="close-button" onClick={handleCloseSuccess}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingSurvey;


