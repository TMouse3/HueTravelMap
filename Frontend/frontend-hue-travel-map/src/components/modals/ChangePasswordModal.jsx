import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { userService } from '../../services/userService';

function ChangePasswordModal({ onClose, onSwitchModal }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }
    if (newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    setIsLoading(true);
    try {
      await userService.changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword
      });
      
      // 1. Cập nhật câu thông báo
      setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      // 2. Xóa thông tin đăng nhập cũ trong bộ nhớ
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 3. Đợi 2 giây để người dùng đọc thông báo, sau đó tự động bật Modal Đăng nhập
      setTimeout(() => {
          onSwitchModal('login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f0edf5] rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition">
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-black text-purple-900 mb-6 text-center">Đổi mật khẩu</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center leading-relaxed">{successMsg}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Mật khẩu cũ */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <input type={showOld ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12" />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                {showOld ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mật khẩu mới</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                {showNew ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg mt-4 disabled:opacity-70">
            {isLoading ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;