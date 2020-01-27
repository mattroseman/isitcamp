import React from 'react';

import './RestartConfirmModal.css';

export default function RestartConfirmModal(props) {
  return (
    <div id="restart-confirm-modal">
      <p id="restart-confirm-text">
        Restart with a new movie?
      </p>
      
      <div id="restart-confirm-modal-options">
        <button
          id="restart-confirm-yes-btn"
          onClick={props.onRestartSurvey}
        >
          Yes
        </button>

        <button
          id="restart-confirm-no-btn"
          onClick={props.onCloseRestartConfirmModal}
        >
          No
        </button>
      </div>
    </div>
  );
}
