import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaChartPie, FaMapMarkedAlt, FaUsers, FaClipboardCheck, 
  FaHome, FaSignOutAlt, FaChevronRight, FaTags, FaCheckCircle
} from 'react-icons/fa';
import { getInitial } from '../utils/stringUtils'; //

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Cập nhật danh sách chức năng theo yêu cầu mới
  const menuItems = [
    { path: '/admin', icon: <FaChartPie />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Quản lý người dùng' },
    { path: '/admin/categories', icon: <FaTags />, label: 'Quản lý danh mục' },
    { path: '/admin/places', icon: <FaMapMarkedAlt />, label: 'Quản lý địa điểm' },
    { path: '/admin/checkins', icon: <FaCheckCircle />, label: 'Quản lý Check-in' },
    { path: '/admin/suggestions', icon: <FaClipboardCheck />, label: 'Quản lý kiến nghị' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR:*/}
      <aside className="w-64 bg-[#2e0052] text-white flex flex-col shadow-2xl z-20">
        
        {/* LOGO:*/}
        <div className="p-8 border-b border-white/50 text-center">
          <Link to="/admin" className="inline-flex flex-col items-center group">
            <span className="text-xl font-black text-white uppercase leading-tight mb-1">
              HUE TRAVEL MAP
            </span>
            <span className="text-3xl font-black text-purple-400 leading-none tracking-tighter">
              ADMIN
            </span>
          </Link>
        </div>

        {/* MENU SIDEBAR */}
        <nav className="flex-grow p-4 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                location.pathname === item.path 
                ? 'bg-white/15 text-white shadow-lg translate-x-1' 
                : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg transition-transform duration-300 ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-[14px] tracking-wide">{item.label}</span>
              </div>
              <FaChevronRight className={`text-[10px] transition-all duration-300 ${location.pathname === item.path ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </Link>
          ))}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-white/50 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-green-400 hover:bg-green-400/10 rounded-xl transition-colors">
            <FaHome /> <span>Về trang người dùng</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <FaSignOutAlt /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAV: */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hệ thống quản trị</span>
            <div className="text-sm font-medium text-gray-600">
              Xin chào, <span className="text-[#430a75] font-black">{user?.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-[#430a75] leading-none">{user?.role}</p>
               <p className="text-[10px] text-gray-400 mt-0.5">{user?.email}</p>
            </div>
            
            {/* AVATAR TRÒN BÊN PHẢI */}
            <div className="w-10 h-10 rounded-full border-2 border-purple-100 p-0.5 shadow-sm">
              {user?.avatarUrl ? (
                <img 
                  src={`http://localhost:8080/hue-travel-map/images/${user.avatarUrl}`} 
                  alt="avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#430a75] to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-inner">
                  {getInitial(user?.fullName)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* VIEWPORT TRANG CON */}
        <section className="flex-1 overflow-y-auto p-8 bg-[#fdfbff]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;