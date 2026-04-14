// Bekräftelsemodal som visas efter att ett projekt skapats, med projekt-ID och Etherscan-länk.
import React from 'react'
import '../styles/CreateNewProjectResult.scss'

const CreateNewProjectResult = ({ result, onClose }) => {
  return (
    <div className="createnewprojectresult-overlay" onClick={onClose} role="presentation">
      <div
        className="createnewprojectresult-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="createnewprojectresult-title"
      >
        <button
          type="button"
          className="createnewprojectresult-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h3 id="createnewprojectresult-title">Projekt skapat</h3>
        <p>Projekt-ID: {result?.projectId ?? '—'}</p>
        <p className="createnewprojectresult-hash">Hash: {result?.txHash ?? '—'}</p>
        <p>Ditt projekt är nu publicerat på blockkedjan.</p>
        {result?.etherscanUrl && (
          <a href={result.etherscanUrl} target="_blank" rel="noreferrer">
            Visa på Sepolia Etherscan
          </a>
        )}
        <div className="createnewprojectresult-actions">
          <button type="button" onClick={onClose}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateNewProjectResult
