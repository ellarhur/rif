import React from 'react'
import '../styles/Navbar.scss'

const Navbar = () => {
  return (
    <nav className="navbar" aria-label="Main">
      <ul className="navbar-list">
        <li className="navbar-item">Home</li>
        <li className="navbar-item">Create</li>
        <li className="navbar-item">Add</li>
        <li className="navbar-item">What is rif?</li>
        <li className="navbar-item">Log out</li>

      </ul>
    </nav>
  )
}

export default Navbar
