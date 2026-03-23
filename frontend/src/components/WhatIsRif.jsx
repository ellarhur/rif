import React from 'react'

const WhatIsRif = ({ onClose }) => {
  return (
    <div className="whatisrif-overlay" onClick={onClose} role="presentation">
      <div
        className="whatisrif-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatisrif-title"
      >
        <button className="whatisrif-close" onClick={onClose} aria-label="Close modal">
          x
        </button>
        <h1 id="whatisrif-title">What is Rif?</h1>
        <p>
          Rif is a proof-of-creative-process platform where artists can collect ideas, sketches,
          and soundbites into projects over time.
        </p>
        <p>
          Instead of only showing the final result, Rif helps you document the path behind your
          creation.
        </p>
      </div>
    </div>
  )
}

export default WhatIsRif
