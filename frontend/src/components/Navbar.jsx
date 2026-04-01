import React from 'react'
import '../styles/Navbar.scss'
import { useState } from 'react'

const Navbar = () => {
    const [isWhatIsRifOpen, setIsWhatIsRifOpen] = useState(false)
    if (isWhatIsRifOpen) {
        return <WhatIsRif onClose={() => setIsWhatIsRifOpen(false)} />
    }
    
  return (
    <nav className="navbar" aria-label="Main">
      <ul className="navbar-list">
        <li className="navbar-item">Home</li>
        <li className="navbar-item">Create</li>
        <li className="navbar-item">Add</li>
        <li className="navbar-item" onClick={() => setIsWhatIsRifOpen(true)}>What is rif?</li>
        <li className="navbar-item">Log out</li>

      </ul>
    </nav>
  )
}

export default Navbar
