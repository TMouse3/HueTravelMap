import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaCamera } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { getInitial } from '../../utils/stringUtils';
import { fileService } from '../../services/fileService';

function ProfileModal({ onClose }) {
  // Lấy dữ liệu user từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email] = useState(currentUser.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý khi người dùng chọn ảnh mới
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // Nếu có chọn file ảnh mới -> Phải upload ảnh trước
      if (selectedFile) {
        // 2. Thay thế khối FormData cồng kềnh bằng 1 dòng gọn gàng
        const uploadRes = await fileService.uploadFile(selectedFile);
        finalAvatarUrl = uploadRes.data; 
      }

      // 3. Thay thế api.put bằng userService.updateProfile
      const res = await userService.updateProfile({
        fullName,
        avatarUrl: finalAvatarUrl
      });

      // Cập nhật lại localStorage với thông tin mới nhất
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccessMsg('Cập nhật thông tin thành công!');
      
      // Tự động tải lại trang sau 1.5s để Navbar nhận ảnh/tên mới
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định ảnh hiển thị: Ảnh vừa chọn (preview) -> Ảnh trong DB -> Avatar chữ cái
  const displayAvatar = previewImage 
    ? previewImage 
    : (avatarUrl ? `http://localhost:8080/hue-travel-map/images/${avatarUrl}` : null);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f0edf5] rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition">
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-black text-purple-900 mb-6 text-center">Thông tin cá nhân</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">{successMsg}</div>}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          
          {/* Vùng Chọn Ảnh Đại Diện */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-3xl">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitial(fullName)
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <FaCamera size={24} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Bấm vào ảnh để thay đổi</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email (Không thể thay đổi)</label>
            <input type="email" value={email} disabled className="w-full px-4 py-3 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg mt-4 disabled:opacity-70">
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;