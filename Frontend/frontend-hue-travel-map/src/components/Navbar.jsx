import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUserEdit, FaKey, FaUserShield, FaHistory, FaMapMarkerAlt } from 'react-icons/fa';
import { getInitial } from '../utils/stringUtils';

function Navbar({ onOpenModal }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsDropdownOpen(false);
    window.location.reload(); 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-[2000] bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center px-8 md:px-12">
      
      <div className="w-full flex justify-between items-center">
        {/* --- CỤM BÊN TRÁI: LOGO & MENU LỊCH SỬ --- */}
        <div className="flex items-center gap-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-purple-800 to-purple-500 bg-clip-text text-transparent tracking-tighter">
              HueTravelMap
            </span>
          </Link>

          {/* Các trang lịch sử */}
          {token && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/my-checkins" className="text-[14px] font-bold text-purple-800 hover:text-purple-600 transition">
                Lịch sử check-in
              </Link>
              <Link to="/my-suggestions" className="text-[14px] font-bold text-purple-800 hover:text-purple-600 transition">
                Lịch sử kiến nghị
              </Link>
            </div>
          )}
        </div>
        {/* -------------------------------------- */}
        <div className="relative">
          {!token ? (
            <button 
              onClick={() => onOpenModal('login')} 
              className="px-6 py-2.5 bg-purple-100 text-purple-800 text-sm font-bold hover:bg-purple-200 transition rounded-full"
            >
              Đăng nhập
            </button>
          ) : (
            <div>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full border border-purple-300 overflow-hidden shadow-sm flex items-center justify-center bg-white">
                    {currentUser?.avatarUrl ? (
                        <img 
                        src={`http://localhost:8080/hue-travel-map/images/${currentUser.avatarUrl}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {getInitial(currentUser?.fullName)}
                        </div>
                    )}
                    </div>
                <span className="font-semibold text-gray-800 text-sm hidden sm:block">{currentUser?.fullName || 'Người dùng'}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-down">
                  {/* --- 2 NÚT DÀNH RIÊNG CHO VIEW MOBILE --- */}
                  <Link 
                    to="/my-checkins" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="md:hidden flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <FaHistory /> <span>Lịch sử check-in</span>
                  </Link>
                  
                  <Link 
                    to="/my-suggestions" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="md:hidden flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <FaMapMarkerAlt /> <span>Lịch sử kiến nghị</span>
                  </Link>
                  {/* ----------------------------------------------- */}
                  
                  <button 
                    onClick={() => { onOpenModal('profile'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <FaUserEdit /> <span>Thông tin cá nhân</span>
                  </button>
                  
                  <button 
                    onClick={() => { onOpenModal('change-password'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <FaKey /> <span>Đổi mật khẩu</span>
                  </button>
                  {currentUser?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition border-t border-gray-100">
                      <FaUserShield /> <span className="font-semibold">Đến trang Quản trị</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                  >
                    <FaSignOutAlt /> <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;