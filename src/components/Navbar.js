import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css';
//import { Button } from './Button';
//import Home from './pages/Home.js';

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const showButton = () => {
    if(window.innerWidth <= 960){
        setButton(false);
    } else {
        setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
        <nav className='navbar'>
            <div className='navbar-container'>
                <Link to="/" className='navbar-logo' onClick={closeMobileMenu}>
                    SeeColor <i className='fab fa-typeo3'/>
                </Link>
                <div className='menu-icon' onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                    <li className='nav-item1'>
                        <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item2'>
                        <Link to='/project-background' className='nav-links' onClick={closeMobileMenu}>
                            Background
                        </Link>
                    </li>
                    <li className='nav-item3'>
                        <Link to='/project' className='nav-links' onClick={closeMobileMenu}>
                            Project
                        </Link>
                    </li>
                    <li className='nav-item4'>
                        <Link to='/research-links' className='nav-links' onClick={closeMobileMenu}>
                            Research Links
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    </>
  )
}

export default Navbar
