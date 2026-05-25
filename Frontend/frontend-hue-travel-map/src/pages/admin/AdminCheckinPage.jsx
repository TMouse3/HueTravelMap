import React, { useState, useEffect } from 'react';
import { FaTrash, FaStar, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaFilter, FaMapMarkerAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { checkinService } from '../../services/checkinService';
import { placeService } from '../../services/placeService';
import { getInitial } from '../../utils/stringUtils';
import { getCategoryIcon } from '../../utils/mapUtils';

function AdminCheckinPage() {
  const [checkins, setCheckins] = useState([]);
  const [places, setPlaces] = useState([]); // Danh sách địa điểm cho Dropdown lọc
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States lọc
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const [fullscreenImage, setFullscreenImage] = useState(null);

  // 1. Fetch dữ liệu Checkin
  const fetchCheckins = async () => {
    setIsLoading(true);
    try {
      const res = await checkinService.getAllCheckinsAdmin(currentPage, 10, selectedPlace, selectedRating);
      setCheckins(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch danh sách địa điểm (Dùng cho Dropdown)
  const fetchPlaces = async () => {
    try {
      // Gọi tạm size 1000 để lấy hết tên địa điểm nhét vào dropdown
      const res = await placeService.getAllPlacesAdmin(0, 1000, '', '');
      setPlaces(res.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [currentPage, selectedPlace, selectedRating]);

  // 3. Xóa Checkin
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.')) {
      try {
        await checkinService.deleteCheckin(id);
        fetchCheckins();
      } catch (err) {
        alert(err.response?.data?.error || 'Xóa thất bại!');
      }
    }
  };

  const renderPageNumbers = () => {
    const pageIndices = [];
    
    // Nếu tổng số trang ít (<= 5), hiển thị tất cả
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pageIndices.push(i);
    } else {
      // Luôn nhét trang đầu tiên
      pageIndices.push(0);
      
      // Tính toán khoảng hiển thị xung quanh trang hiện tại (Current - 1, Current, Current + 1)
      let left = Math.max(1, currentPage - 1);
      let right = Math.min(totalPages - 2, currentPage + 1);
      
      // Xử lý ngoại lệ khi đứng ở các trang rìa
      if (currentPage === 0) right = 2;
      if (currentPage === totalPages - 1) left = totalPages - 3;
      
      // Chèn dấu ... bên trái
      if (left > 1) pageIndices.push('...');
      
      // Chèn các trang ở giữa
      for (let i = left; i <= right; i++) pageIndices.push(i);
      
      // Chèn dấu ... bên phải
      if (right < totalPages - 2) pageIndices.push('...');
      
      // Luôn nhét trang cuối cùng
      pageIndices.push(totalPages - 1);
    }

    return pageIndices.map((item, index) => {
      // Render dấu 3 chấm
      if (item === '...') {
        return (
          <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold tracking-widest">
            ...
          </span>
        );
      }
      
      // Render nút số trang
      return (
        <button 
          key={`page-${item}`} 
          onClick={() => setCurrentPage(item)} 
          className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
            currentPage === item 
            ? 'bg-[#430a75] text-white shadow-md' 
            : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          {item + 1}
        </button>
      );
    });
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#430a75]">Quản lý Check-in</h1>
          <p className="text-gray-500 text-sm">Kiểm duyệt các bài đánh giá từ người dùng</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Bộ lọc */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <select value={selectedPlace} onChange={e => {setSelectedPlace(e.target.value); setCurrentPage(0);}} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none transition text-sm appearance-none font-bold text-gray-600">
               <option value="">-- Tất cả địa điểm --</option>
               {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          </div>
          <div className="w-full md:w-64 relative">
            <select value={selectedRating} onChange={e => {setSelectedRating(e.target.value); setCurrentPage(0);}} className="w-full px-11 py-3 rounded-2xl border border-gray-200 outline-none appearance-none text-sm font-bold text-gray-600">
               <option value="">Tất cả Số sao</option>
               <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
               <option value="4">⭐⭐⭐⭐ (4 sao)</option>
               <option value="3">⭐⭐⭐ (3 sao)</option>
               <option value="2">⭐⭐ (2 sao)</option>
               <option value="1">⭐ (1 sao)</option>
            </select>
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-700"/>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Người đánh giá</th>
                <th className="px-6 py-4">Địa điểm & Số sao</th>
                <th className="px-6 py-4 w-[40%]">Nội dung</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="p-20 text-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : checkins.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500 font-bold">Chưa có bài check-in nào.</td></tr>
              ) : checkins.map(item => (
                <tr key={item.id} className="hover:bg-purple-50/30 transition-colors group align-top">
                  
                  {/* Cột User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.userAvatar ? (
                        <img src={`http://localhost:8080/hue-travel-map/images/${item.userAvatar}`} className="w-10 h-10 rounded-full object-cover shadow-sm"/>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-inner">
                          {getInitial(item.userFullName)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.userFullName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                           {new Date(item.createdDate).toLocaleDateString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center shrink-0 shadow-sm">
                        {getCategoryIcon(item.categoryId, "text-white text-[10px]")}
                      </div>
                      <span className="font-black text-[#430a75] text-sm truncate" title={item.placeName}>
                        {item.placeName}
                      </span>
                    </div>

                    <div className="flex text-yellow-500 text-[12px] ml-8">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < item.rating ? "" : "text-gray-200"}/>
                      ))}
                    </div>
                  </td>
                  
                  {/* Cột Nội dung & Hình ảnh */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">"{item.content}"</p>
                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {item.images.map(img => (
                          <img 
                            key={img.id} 
                            src={`http://localhost:8080/hue-travel-map/images/${img.url}`} 
                            className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform" 
                            onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                  
                  {/* Cột Nút xóa */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                       <button onClick={()=>handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Xóa bài">
                          <FaTrash size={18}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50/50">
            <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaAngleDoubleLeft size={12}/></button>
            <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaChevronLeft size={10}/></button>
            <div className="flex gap-1.5">{renderPageNumbers()}</div>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaChevronRight size={10}/></button>
            <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaAngleDoubleRight size={12}/></button>
          </div>
        )}
      </div>

      {/* MODAL XEM ẢNH FULLSCREEN */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[6000] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
            <IoClose size={28} />
          </button>
          <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen" />
        </div>
      )}
    </div>
  );
}

export default AdminCheckinPage;