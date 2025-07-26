import React, { useState } from 'react';
import logo from '../assets/assets_frontend/logo.svg';
import profile_pic from '../assets/assets_frontend/profile_pic.png';
import dropDownIcon from '../assets/assets_frontend/dropdown_icon.svg';
import menu_icon from '../assets/assets_frontend/menu_icon.svg';
import cross_icon from '../assets/assets_frontend/cross_icon.png';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img
        onClick={() => navigate('/')}
        className='w-44 cursor-pointer'
        src={logo}
        alt='logo'
      />

      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/' end className='nav-link'>
          <li className='py-1'>Home</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>

        <NavLink to='/doctors' className='nav-link'>
          <li className='py-1'>All Doctors</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>

        <NavLink to='/about' className='nav-link'>
          <li className='py-1'>About</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>

        <NavLink to='/contact' className='nav-link'>
          <li className='py-1'>Contact</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-4 relative'>
        {token ? (
          <div
            className='flex items-center gap-2 cursor-pointer'
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <img className='w-8 rounded-full' src={profile_pic} alt='profile' />
            <img className='w-2.5' src={dropDownIcon} alt='dropdown' />
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'
          >
            Create Account
          </button>
        )}

        {/* Profile Dropdown */}
        {showProfileMenu && (
          <div className='absolute top-14 right-0 text-base font-medium text-gray-600 z-20 bg-stone-100 rounded flex flex-col gap-4 p-4'>
            <p
              onClick={() => {
                navigate('my-profile');
                setShowProfileMenu(false);
              }}
              className='hover:text-black cursor-pointer'
            >
              My Profile
            </p>
            <p
              onClick={() => {
                navigate('my-appointment');
                setShowProfileMenu(false);
              }}
              className='hover:text-black cursor-pointer'
            >
              My Appointment
            </p>
            <p
              onClick={() => {
                setToken(false);
                setShowProfileMenu(false);
              }}
              className='hover:text-black cursor-pointer'
            >
              Logout
            </p>
          </div>
        )}

        <img
          onClick={() => setShowMenu(true)}
          className='w-6 md:hidden'
          src={menu_icon}
          alt=''
        />

        {/* ----Mobile Menu---- */}
        <div
          className={`${
            showMenu ? 'fixed w-full' : 'h-0 w-0'
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='w-36' src={logo} alt='' />
            <img
              className='w-7'
              onClick={() => setShowMenu(false)}
              src={cross_icon}
              alt=''
            />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'>
              <p className='px-4 py-2 rounded inline-block'>Home</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
              <p className='px-4 py-2 rounded inline-block'>ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'>
              <p className='px-4 py-2 rounded inline-block'>ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'>
              <p className='px-4 py-2 rounded inline-block'>CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
