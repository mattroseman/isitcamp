import React, { useEffect, useRef } from 'react';

import './RestartConfirmModal.scss';

export default function RestartConfirmModal(props) {
  const modalRef = useRef(null);

  function handlePageClick(event) {
    if (!modalRef.current.contains(event.target)) {
      props.onCloseRestartConfirmModal();

      event.preventDefault();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handlePageClick);

    return () => {
      document.removeEventListener('click', handlePageClick);
    }
  }, []);

  return (
    <div id="restart-confirm-modal" ref={modalRef}>
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
