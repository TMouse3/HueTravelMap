import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaCheck, FaTimes, FaFilter, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { suggestionService } from '../../services/suggestionService';
import { getCategoryIcon } from '../../utils/mapUtils';
import { getInitial } from '../../utils/stringUtils';

function AdminSuggestionPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [fullscreenImage, setFullscreenImage] = useState(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await suggestionService.getAllSuggestionsForAdmin(currentPage, 10, appliedName, selectedStatus);
      setSuggestions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [currentPage, appliedName, selectedStatus]);

  // Xử lý các thao tác của Admin
  const handleApprove = async (id) => {
    if (window.confirm('Duyệt kiến nghị này? Hệ thống sẽ tự động tạo một Địa điểm mới trên bản đồ dựa theo thông tin này.')) {
      try {
        await suggestionService.approveSuggestion(id);
        alert('Phê duyệt thành công!');
        fetchSuggestions();
      } catch (err) { alert(err.response?.data?.error || 'Lỗi duyệt!'); }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Bạn muốn từ chối kiến nghị này?')) {
      try {
        await suggestionService.rejectSuggestion(id);
        fetchSuggestions();
      } catch (err) { alert(err.response?.data?.error || 'Lỗi từ chối!'); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa vĩnh viễn kiến nghị này?')) {
      try {
        await suggestionService.deleteSuggestion(id);
        fetchSuggestions();
      } catch (err) { alert(err.response?.data?.error || 'Không thể xóa!'); }
    }
  };

  const renderStatus = (status) => {
    if (status === 'APPROVED') return <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase">Đã duyệt</span>;
    if (status === 'REJECTED') return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase">Đã từ chối</span>;
    return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase">Chờ xử lý</span>;
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
          <h1 className="text-2xl font-black text-[#430a75]">Duyệt kiến nghị địa điểm</h1>
          <p className="text-gray-500 text-sm">Xem xét và phê duyệt các địa điểm do người dùng đóng góp</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Thanh tìm kiếm & Bộ lọc */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input type="text" placeholder="Tìm tên địa điểm..." value={searchName} onChange={e=>setSearchName(e.target.value)} onKeyDown={e=>e.key==='Enter' && setAppliedName(searchName)} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none transition text-sm" />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          </div>
          <div className="w-full md:w-64 relative">
            <select value={selectedStatus} onChange={e=>{setSelectedStatus(e.target.value); setCurrentPage(0);}} className="w-full px-11 py-3 rounded-2xl border border-gray-200 outline-none appearance-none text-sm font-bold text-gray-600">
               <option value="">Tất cả trạng thái</option>
               <option value="PENDING">Chờ xử lý</option>
               <option value="APPROVED">Đã duyệt</option>
               <option value="REJECTED">Đã từ chối</option>
            </select>
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-700"/>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 w-1/4">Người gửi</th>
                <th className="px-6 py-4">Thông tin địa điểm</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="p-20 text-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : suggestions.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500 font-bold">Không có kiến nghị nào.</td></tr>
              ) : suggestions.map(item => (
                <tr key={item.id} className="hover:bg-purple-50/30 transition-colors align-top">
                  
                  {/* Cột User trong AdminSuggestionPage.jsx */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.userAvatar ? (
                        <img 
                          src={`http://localhost:8080/hue-travel-map/images/${item.userAvatar}`} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm"
                          alt="avatar"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {getInitial(item.userFullName)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-[13px]">{item.userFullName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {new Date(item.createdDate).toLocaleDateString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột Địa điểm */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      {/* Cụm ảnh */}
                      <div className="flex flex-col gap-1.5 shrink-0 w-[72px]">
                        <img 
                          src={`http://localhost:8080/hue-travel-map/images/${item.thumbnailUrl}`} 
                          className="w-[72px] h-[72px] rounded-2xl object-cover shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-400"
                          onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${item.thumbnailUrl}`)}
                        />
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1 justify-start">
                            {item.images.map(img => (
                              <img key={img.id} src={`http://localhost:8080/hue-travel-map/images/${img.url}`} className="w-5 h-5 rounded-md object-cover cursor-pointer hover:opacity-80" onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}/>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cụm Text */}
                      <div className="flex flex-col py-1">
                        <span className="font-black text-[#430a75] text-[14px] leading-tight">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1 mb-2">
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-[9px] font-black uppercase">
                             {getCategoryIcon(item.category?.id, "text-purple-700 text-[10px]")} {item.category?.name}
                           </span>
                           <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase"><FaMapMarkerAlt className="text-red-400"/> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span>
                        </div>
                        <p className="text-[12px] text-gray-600 line-clamp-2 italic leading-relaxed">"{item.description || 'Không có mô tả'}"</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Trạng thái */}
                  <td className="px-6 py-4 text-center align-middle">
                    {renderStatus(item.status)}
                  </td>
                  
                  {/* Thao tác */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex justify-center gap-2">
                       {item.status === 'PENDING' && (
                         <>
                           <button onClick={()=>handleApprove(item.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition" title="Duyệt thành địa điểm"><FaCheck size={18}/></button>
                           <button onClick={()=>handleReject(item.id)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition" title="Từ chối"><FaTimes size={18}/></button>
                         </>
                       )}
                       {item.status !== 'APPROVED' && (
                         <button onClick={()=>handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Xóa"><FaTrash size={18}/></button>
                       )}
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

      {fullscreenImage && (
        <div className="fixed inset-0 z-[6000] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"><IoClose size={28} /></button>
          <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen" />
        </div>
      )}
    </div>
  );
}

export default AdminSuggestionPage;