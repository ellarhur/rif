import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Navbar.scss'
import WhatIsRif from './WhatIsRif'
import { useWallet } from '../context/WalletContext.jsx'

const Navbar = () => {
    const navigate = useNavigate()
    const { disconnect } = useWallet()
    const [isWhatIsRifOpen, setIsWhatIsRifOpen] = useState(false)
    if (isWhatIsRifOpen) {
        return <WhatIsRif onClose={() => setIsWhatIsRifOpen(false)} />
    }
    
  return (
    <nav className="navbar" aria-label="Main">
      <ul className="navbar-list">
        <li className="navbar-item" onClick={() => navigate('/dashboard')}>Home</li>
        <li className="navbar-item" onClick={() => setIsWhatIsRifOpen(true)}>What is rif?</li>
        <li className="navbar-item" onClick={() => { disconnect(); navigate('/') }}>Log out</li>

      </ul>
    </nav>
  )
}

export default Navbar
