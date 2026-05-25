import React, { useState, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/authService';

function ForgotPasswordModal({ onClose, onSwitchModal }) {
  const [step, setStep] = useState(1); 
  
  // Form data
  const [email, setEmail] = useState('');
  
  // Khởi tạo OTP là mảng 6 phần tử rỗng
  const [otp, setOtp] = useState(new Array(6).fill('')); 
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sử dụng useRef để quản lý tiêu điểm (focus) của 6 ô input
  const otpRefs = useRef([]);

  // Hàm xử lý khi nhập số vào 1 ô
  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo nếu có nhập và không phải ô cuối cùng
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Hàm xử lý khi bấm nút Xóa (Backspace)
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Nếu ô hiện tại rỗng và bấm nút xóa -> Nhảy lùi về ô trước đó
      otpRefs.current[index - 1].focus();
    }
  };

  // Hàm xử lý dán (paste) 6 số cùng lúc
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    
    // Kiểm tra xem dữ liệu dán có phải là số không
    if (/^\d+$/.test(pastedData)) {
      const pastedArray = pastedData.split('');
      const newOtp = [...otp];
      pastedArray.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);

      // Nhảy focus đến ô cuối cùng được điền
      const focusIndex = pastedArray.length < 6 ? pastedArray.length : 5;
      otpRefs.current[focusIndex].focus();
    }
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.data.message || 'Mã OTP đã được gửi đến email của bạn.');
      setStep(2); 
      setOtp(new Array(6).fill('')); // Xóa sạch các ô OTP nếu là gửi lại
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Nối mảng OTP lại thành chuỗi 6 ký tự
    const otpString = otp.join('');
    
    // Kiểm tra đủ 6 số
    if (otpString.length !== 6) {
      return setError('Vui lòng nhập đầy đủ 6 số OTP!');
    }

    if (newPassword !== confirmNewPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    if (newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: otpString, // Gửi chuỗi lên API
        newPassword,
        confirmNewPassword
      });
      
      setSuccessMsg('Đặt lại mật khẩu thành công! Chuyển hướng đến đăng nhập...');
      
      setTimeout(() => {
        onSwitchModal('login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
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

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-purple-900 mb-2">Quên mật khẩu</h2>
          <p className="text-sm text-gray-600">
            {step === 1 ? 'Nhập email của bạn để nhận mã xác nhận.' : 'Nhập mã OTP và thiết lập mật khẩu mới.'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">{successMsg}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email đã đăng ký</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required
                className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 mt-2">
              {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* --- KHỐI NHẬP OTP 6 Ô --- */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 mb-2 text-center">Mã OTP gửi về: <span className="text-purple-700 font-bold">{email}</span></label>
              <div className="flex justify-center gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-xl font-black text-purple-900 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm bg-white transition-all"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mật khẩu mới</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới" 
                  required minLength={6}
                  className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới" 
                  required minLength={6}
                  className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition">
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 mt-4">
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
            
            <div className="text-center mt-2">
               <button type="button" onClick={() => handleSendOTP()} disabled={isLoading} className="text-xs font-bold text-purple-700 hover:underline disabled:opacity-50">
                 Gửi lại mã OTP
               </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <button onClick={() => onSwitchModal('login')} className="font-bold text-purple-800 hover:underline">
            Quay lại Đăng nhập
          </button>
        </div>

      </div>
    </div>
  );
}

export default ForgotPasswordModal;