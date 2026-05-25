import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/authService';

function RegisterModal({ onClose, onSwitchModal }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    setIsLoading(true);
    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      setSuccessMsg('Đăng ký thành công! Đang chuyển đến đăng nhập...');
      setTimeout(() => {
        onSwitchModal('login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto py-10">
      <div className="bg-[#f0edf5] rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-4 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition">
          <IoClose size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-purple-900 mb-2">Đăng ký</h2>
          <p className="text-sm text-gray-600">Tạo tài khoản để khám phá HueTravelMap</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">{successMsg}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Họ và tên</label>
            <input type="text" name="fullName" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" placeholder="Nhập họ và tên" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" placeholder="Nhập email" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12" placeholder="Nhập mật khẩu" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12" placeholder="Nhập lại mật khẩu" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 mt-4">
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <button onClick={() => onSwitchModal('login')} className="font-bold text-purple-800 hover:underline">Đăng nhập</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;