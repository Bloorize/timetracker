import React, { useState, useRef, useEffect } from 'react';
import { signOut } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  if (!user) return null;

  const arrowDownIcon = `${process.env.PUBLIC_URL}/icons/arrow_down.svg`;
  const arrowUpIcon = `${process.env.PUBLIC_URL}/icons/arrow_up.svg`;

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {user.email.split('@')[0]}
        <img 
          src={menuOpen ? arrowUpIcon : arrowDownIcon} 
          alt={menuOpen ? "Collapse menu" : "Expand menu"} 
          style={{ marginLeft: '4px', width: '18px', height: '18px' }}
        />
      </button>
      
      {menuOpen && (
        <div className="user-menu-dropdown">
          <div className="user-email">{user.email}</div>
          <button className="user-menu-item" onClick={handleSignOut}>
            <span className="material-icons-outlined" style={{ marginRight: '8px', fontSize: '18px', verticalAlign: 'text-bottom' }}>
              logout
            </span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 