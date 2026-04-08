import React from 'react'
import '../styles/WhatIsRif.scss'

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
        <h1 id="whatisrif-title">Vad är Rif?</h1>
        <p>
          Rif är en plattform för dig som låtskrivare att bevisa din kreativa process. Du kan samla dina idéer, skisser och soundbites i projekt över tid.
        </p>
        <p>
          Istället för att bara visa slutresultatet hjälper Rif dig att dokumentera vägen bakom din skapelse. Varje soundbite blir som en skärmdump på hur låten lät vid en viss tidpunkt.
        </p>
      </div>
    </div>
  )
}

export default WhatIsRif
