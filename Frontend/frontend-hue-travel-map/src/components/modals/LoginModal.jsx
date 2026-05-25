import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

function LoginModal({ onClose, onSwitchModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Gọi API login từ backend đã cấu hình
      const res = await authService.login({ email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      
      const profileRes = await userService.getMyProfile();
      const user = profileRes.data;
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = user.role === 'ADMIN' ? '/admin' : '/'; 
      
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f0edf5] rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-4">
        
        {/* Nút Đóng */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition"
        >
          <IoClose size={24} />
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-purple-900 mb-2">Chào mừng trở lại!</h2>
          <p className="text-sm text-gray-600">Đăng nhập để tiếp tục khám phá Huế.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* Form Đăng nhập */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vidu@gmail.com" 
              required
              className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-left">
            <button 
              type="button" 
              onClick={() => onSwitchModal('forgot-password')}
              className="text-xs font-bold text-purple-800 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 mt-2"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <button onClick={() => onSwitchModal('register')} className="font-bold text-purple-800 hover:underline">
            Đăng ký ngay
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;