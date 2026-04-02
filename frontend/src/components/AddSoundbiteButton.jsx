import React from 'react'
import '../styles/AddSoundbite.scss'

const AddSoundbiteButton = ({ onClose }) => {
  return (
    <div className="addsoundbite-overlay" onClick={onClose} role="presentation">
      <div
        className="addsoundbite-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addsoundbite-title"
      >
        <button className="addsoundbite-close" onClick={onClose} aria-label="Close modal">
          x
        </button>
        <h1 id="addsoundbite-title">Add Soundbite</h1>
        <p>Add a new soundbite to an existing project.</p>
        <input type="text" placeholder="Project ID" />
        <input type="text" placeholder="IPFS CID" />
        <input type="file" />
        <input type="text" placeholder="Type (audio, lyric, note...)" />
        <input type="text" placeholder="Description" />
        <button onClick={onClose}>Cancel</button>
        <button onClick={onClose}>Add Soundbite</button>
      </div>
    </div>
  )
}

export default AddSoundbiteButton
