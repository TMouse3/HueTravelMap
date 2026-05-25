import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaStar, FaImage, FaTrash } from 'react-icons/fa';
import { checkinService } from '../../services/checkinService';
import { fileService } from '../../services/fileService';

function CheckinModal({ onClose, place, userLat, userLng, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý chọn ảnh (Tối đa 3 ảnh)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      return setError('Bạn chỉ được tải lên tối đa 3 ảnh!');
    }
    setError('');
    setSelectedFiles(prev => [...prev, ...files].slice(0, 3));
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Check-in
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return setError('Vui lòng nhập nội dung đánh giá!');
    
    setIsLoading(true);
    setError('');

    try {
      // 1. DÙNG API UPLOAD NHIỀU FILE (BULK UPLOAD)
      let uploadedFileNames = [];
      
      // Chỉ gọi API up ảnh nếu người dùng thực sự có chọn ảnh
      if (selectedFiles.length > 0) {
        // Gửi toàn bộ mảng file lên backend trong 1 request
        const uploadRes = await fileService.uploadMultipleFiles(selectedFiles);
        
        // Backend của bạn sẽ trả về một mảng chứa tên các file đã lưu (ví dụ: ["img1.jpg", "img2.png"])
        uploadedFileNames = uploadRes.data; 
      }

      // 2. Gửi request Check-in
      await checkinService.createCheckin({
        rating,
        content,
        placeId: place.id,
        userLat,
        userLng,
        imageNames: uploadedFileNames
      });

      // 3. Thông báo thành công và reload lại danh sách
      onSuccess();
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra khi gửi check-in.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 relative shadow-2xl flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition">
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-black text-[#2e0052] mb-1">Check-in</h2>
        <p className="text-gray-500 text-sm mb-6 font-semibold border-b pb-4">{place?.name}</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="overflow-y-auto no-scrollbar pr-2 flex-grow">
          <form id="checkin-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Đánh giá Sao */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Đánh giá của bạn</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    size={28} 
                    className={`cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Nội dung đánh giá */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chia sẻ trải nghiệm</label>
              <textarea 
                rows="4" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Địa điểm này thế nào? Bạn thích điều gì nhất?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition resize-none text-sm"
              ></textarea>
            </div>

            {/* Chọn ảnh (Tối đa 3) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                <span>Hình ảnh thực tế <span className="text-gray-400 font-normal">(Tối đa 3 ảnh)</span></span>
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{selectedFiles.length}/3</span>
              </label>
              
              <div className="flex flex-wrap gap-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(idx)} 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                
                {selectedFiles.length < 3 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition text-gray-400 hover:text-purple-500">
                    <FaImage size={24} />
                    <span className="text-[10px] font-bold mt-1">Thêm ảnh</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </form>
        </div>

        <button 
          form="checkin-form"
          type="submit" 
          disabled={isLoading}
          className="w-full mt-6 py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 shrink-0"
        >
          {isLoading ? 'Đang gửi...' : 'Gửi Check-in'}
        </button>
      </div>
    </div>
  );
}

export default CheckinModal;