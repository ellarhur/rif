import React from 'react'
import '../styles/Navbar.scss'

const Navbar = () => {
  return (
    <div>
      <ul className="navbar-list">
        <li className="navbar-item">Home</li>
        <li className="navbar-item">Create</li>
        <li className="navbar-item">Add</li>
        <li className="navbar-item">What?</li>
      </ul>
    </div>
  )
}

export default Navbar
