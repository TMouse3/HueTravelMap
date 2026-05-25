import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaImage, FaTrash, FaAsterisk, FaMapMarkerAlt } from 'react-icons/fa';
import { placeService } from '../../services/placeService';
import { fileService } from '../../services/fileService';
import { categoryService } from '../../services/categoryService';

function PlaceAdminModal({ onClose, onSuccess, editingPlace = null }) {
  const [formData, setFormData] = useState({
    name: '', description: '', categoryId: '', lat: '', lng: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [mainImage, setMainImage] = useState(null); // File mới
  const [existingThumbnail, setExistingThumbnail] = useState(''); // Tên file cũ (khi sửa)
  
  const [additionalFiles, setAdditionalFiles] = useState([]); // List file mới
  const [existingImages, setExistingImages] = useState([]); // List tên file cũ

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Tải danh sách loại để chọn
    const fetchCats = async () => {
      const res = await categoryService.getAllCategories();
      setCategories(res.data);
    };
    fetchCats();

    // 2. Nếu là sửa bài, đổ dữ liệu cũ vào form
    if (editingPlace) {
      setFormData({
        name: editingPlace.name,
        description: editingPlace.description || '',
        categoryId: editingPlace.category?.id || '',
        lat: editingPlace.lat,
        lng: editingPlace.lng
      });
      setExistingThumbnail(editingPlace.thumbnailUrl);
      setExistingImages(editingPlace.images?.map(img => img.url) || []);
    }
  }, [editingPlace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let uploadedThumbnail = existingThumbnail;
      let finalAdditionalNames = [...existingImages];

      // Upload ảnh chính nếu có chọn mới
      if (mainImage) {
        const res = await fileService.uploadFile(mainImage);
        uploadedThumbnail = res.data;
      }

      // Upload ảnh phụ nếu có thêm mới
      if (additionalFiles.length > 0) {
        const res = await fileService.uploadMultipleFiles(additionalFiles);
        finalAdditionalNames = [...finalAdditionalNames, ...res.data];
      }

      const payload = {
        ...formData,
        thumbnailUrl: uploadedThumbnail,
        imageNames: finalAdditionalNames
      };

      if (editingPlace) {
        await placeService.updatePlace(editingPlace.id, payload);
      } else {
        await placeService.createPlace(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi thao tác dữ liệu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-[#430a75]">{editingPlace ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><IoClose size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block uppercase tracking-wider">Tên địa điểm <FaAsterisk className="inline text-[8px] text-red-500"/></label>
              <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none transition" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block uppercase tracking-wider">Danh mục</label>
              <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                <option value="">-- Chọn loại --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Vĩ độ (Lat)</label>
                <input type="number" step="any" value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} required className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Kinh độ (Lng)</label>
                <input type="number" step="any" value={formData.lng} onChange={e=>setFormData({...formData, lng: e.target.value})} required className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-purple-50/30 p-5 rounded-2xl border border-purple-100 space-y-4">
             {/* Upload ảnh chính */}
             <div>
               <label className="text-xs font-bold text-[#430a75] mb-2 block uppercase tracking-wide">Ảnh đại diện chính</label>
               <div className="flex gap-4 items-center">
                  {(mainImage || existingThumbnail) && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-300 shadow-sm shrink-0">
                      <img src={mainImage ? URL.createObjectURL(mainImage) : `http://localhost:8080/hue-travel-map/images/${existingThumbnail}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="h-24 flex-1 border-2 border-dashed border-purple-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition">
                    <FaImage className="text-purple-300" size={24}/>
                    <span className="text-[10px] font-bold text-purple-400 mt-1 uppercase">Chọn ảnh mới</span>
                    <input type="file" className="hidden" onChange={e => setMainImage(e.target.files[0])}/>
                  </label>
               </div>
             </div>

             {/* Upload ảnh phụ */}
             <div>
                <label className="text-xs font-bold text-[#430a75] mb-2 block uppercase tracking-wide">Ảnh chi tiết (Tối đa 3)</label>
                <div className="flex flex-wrap gap-2">
                   {existingImages.map((url, i) => (
                     <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group border border-gray-200">
                        <img src={`http://localhost:8080/hue-travel-map/images/${url}`} className="w-full h-full object-cover opacity-50"/>
                        <button type="button" onClick={()=>setExistingImages(existingImages.filter((_,idx)=>idx!==i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"><FaTrash size={12}/></button>
                     </div>
                   ))}
                   {additionalFiles.map((file, i) => (
                     <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-300">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover"/>
                        <button type="button" onClick={()=>setAdditionalFiles(additionalFiles.filter((_,idx)=>idx!==i))} className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-bl-lg"><IoClose size={10}/></button>
                     </div>
                   ))}
                   {(existingImages.length + additionalFiles.length) < 3 && (
                     <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-white">
                        <FaImage className="text-gray-300"/>
                        <input type="file" multiple className="hidden" onChange={e => setAdditionalFiles([...additionalFiles, ...Array.from(e.target.files)].slice(0, 3 - existingImages.length))}/>
                     </label>
                   )}
                </div>
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Mô tả địa điểm</label>
            <textarea rows="4" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 resize-none text-sm" placeholder="Nhập mô tả lịch sử, đặc điểm..."></textarea>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/30">
          <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Hủy bỏ</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-3 bg-[#430a75] hover:bg-purple-900 text-white font-black rounded-xl shadow-lg transition disabled:opacity-50">
            {isLoading ? 'Đang xử lý...' : (editingPlace ? 'Cập nhật ngay' : 'Tạo địa điểm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceAdminModal;