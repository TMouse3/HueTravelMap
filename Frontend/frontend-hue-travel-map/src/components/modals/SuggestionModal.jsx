import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaMapMarkerAlt, FaImage, FaTrash, FaListUl, FaAsterisk } from 'react-icons/fa';
import { suggestionService } from '../../services/suggestionService';
import { fileService } from '../../services/fileService';

function SuggestionModal({ onClose, lat, lng, categories, onSuccess }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  // Tách riêng state cho Ảnh chính (bắt buộc) và Ảnh phụ (tối đa 3)
  const [mainImage, setMainImage] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý Ảnh chính
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setError('');
    }
  };

  // Xử lý Ảnh phụ
  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (additionalFiles.length + files.length > 3) {
      return setError('Bạn chỉ được tải lên tối đa 3 ảnh phụ!');
    }
    setError('');
    setAdditionalFiles(prev => [...prev, ...files].slice(0, 3));
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Vui lòng nhập tên địa điểm!');
    if (!categoryId) return setError('Vui lòng chọn danh mục!');
    if (!mainImage) return setError('Vui lòng tải lên ảnh đại diện (ảnh chính) cho địa điểm!');
    
    setIsLoading(true);
    setError('');

    try {
      let uploadedMainImageName = '';
      let uploadedAdditionalFileNames = [];

      // 1. Upload Ảnh Chính (dùng API upload 1 file)
      const mainUploadRes = await fileService.uploadFile(mainImage);
      uploadedMainImageName = mainUploadRes.data;

      // 2. Upload Ảnh Phụ (dùng API upload nhiều file nếu có)
      if (additionalFiles.length > 0) {
        const additionalUploadRes = await fileService.uploadMultipleFiles(additionalFiles);
        uploadedAdditionalFileNames = additionalUploadRes.data;
      }

      // 3. Gửi Request Kiến Nghị
      // LƯU Ý: Đảm bảo trường thumbnailUrl và imageNames khớp với DTO ở Backend của bạn
      await suggestionService.createSuggestion({
        name,
        categoryId,
        description,
        lat,
        lng,
        thumbnailUrl: uploadedMainImageName, // Ảnh chính
        imageNames: uploadedAdditionalFileNames // Danh sách ảnh phụ
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi gửi kiến nghị.');
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

        <h2 className="text-2xl font-black text-[#2e0052] mb-1">Kiến nghị địa điểm</h2>
        <p className="text-gray-500 text-sm mb-6 flex items-center gap-1 border-b pb-4">
            Tọa độ: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        </p>

        <div className="overflow-y-auto no-scrollbar pr-2 flex-grow">
          <form id="suggestion-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Tên địa điểm */}
            <div className="relative px-1 pb-1">
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                    Tên địa điểm kiến nghị <FaAsterisk className="text-[8px] text-red-500 ml-1" /></label>
                <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Ví dụ: Quán cafe X, Di tích Y..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition text-sm"
                />
            </div>

            {/* Danh mục */}
            <div className="relative px-1 pb-1">
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                    Danh mục <FaAsterisk className="text-[8px] text-red-500 ml-1" />
                </label>
                <div className="relative">
                    <select 
                    value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition text-sm appearance-none cursor-pointer"
                    >
                    <option value="">-- Chọn loại địa điểm --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <FaListUl className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* VÙNG CHỌN ẢNH */}
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              
              {/* Ảnh chính (Bắt buộc) */}
              <div className="mb-5">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  Ảnh chính <FaAsterisk className="text-[8px] text-red-500 ml-1" />
                </label>
                <div className="flex">
                  {mainImage ? (
                    <div className="relative w-32 h-32 group rounded-xl overflow-hidden border-2 border-purple-300 shadow-sm">
                      <img src={URL.createObjectURL(mainImage)} alt="main-preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setMainImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs gap-1">
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-purple-300 bg-white rounded-xl cursor-pointer hover:bg-purple-100 transition text-purple-600">
                      <FaImage size={28} className="mb-1" />
                      <span className="text-[10px] font-bold">Chọn ảnh chính</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Ảnh phụ (Tùy chọn) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center justify-between">
                  <span>Ảnh phụ <span className="text-gray-500 font-normal">(Không bắt buộc)</span></span>
                  <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-md font-bold">{additionalFiles.length}/3</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {additionalFiles.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveAdditionalImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <FaTrash size={16} />
                      </button>
                    </div>
                  ))}
                  {additionalFiles.length < 3 && (
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition text-gray-400 hover:text-purple-500">
                      <FaImage size={24} />
                      <span className="text-[10px] font-bold mt-1">Thêm ảnh</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleAdditionalImageChange} />
                    </label>
                  )}
                </div>
              </div>

            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Mô tả</label>
              <textarea 
                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Hãy cho chúng tôi biết thêm về địa điểm này..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition resize-none text-sm"
              ></textarea>
            </div>

          </form>
        </div>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        <button 
          form="suggestion-form" type="submit" disabled={isLoading}
          className="w-full mt-6 py-3.5 bg-[#2e0052] hover:bg-[#1a0033] text-white font-bold rounded-xl transition shadow-lg disabled:opacity-70 shrink-0"
        >
          {isLoading ? 'Đang gửi kiến nghị...' : 'Gửi kiến nghị'}
        </button>
      </div>
    </div>
  );
}

export default SuggestionModal;