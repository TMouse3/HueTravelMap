import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaTag, 
  FaTrophy, FaChevronLeft, FaChevronRight, 
  FaAngleDoubleLeft, FaAngleDoubleRight, FaSearch, FaTrash
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import { suggestionService } from '../services/suggestionService';
import { getCategoryIcon } from '../utils/mapUtils'; // <-- IMPORT ICON

function MySuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [totalApproved, setTotalApproved] = useState(0); 
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(''); 
  const [appliedQuery, setAppliedQuery] = useState(''); 
  const [statusFilter, setStatusFilter] = useState(''); 

  const fetchMySuggestions = async () => {
    setIsLoading(true);
    if (currentPage > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await suggestionService.getMySuggestions(currentPage, 10, appliedQuery, statusFilter);
      setSuggestions(res.data.suggestionsPage.content); 
      setTotalApproved(res.data.totalApproved);
      setTotalPages(res.data.suggestionsPage.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySuggestions();
  }, [currentPage, appliedQuery, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setAppliedQuery(searchQuery);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  // HÀM XÓA KIẾN NGHỊ
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kiến nghị này? Hành động này không thể hoàn tác.')) {
      try {
        await suggestionService.deleteSuggestion(id);
        fetchMySuggestions(); // Reload data
      } catch (err) {
        alert(err.response?.data?.error || 'Xóa thất bại!');
      }
    }
  };

  const renderStatus = (status) => {
    const s = status?.toUpperCase();
    if (s === 'APPROVED') return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-[11px] font-bold border border-green-100">Đã duyệt</span>;
    if (s === 'REJECTED') return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-[11px] font-bold border border-red-100">Từ chối</span>;
    return <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-100">Chờ duyệt</span>;
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
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-5xl animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center text-purple-700 shadow-sm border border-gray-100 hover:bg-purple-50 transition">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[#2e0052]">Lịch sử kiến nghị</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Theo dõi các địa điểm bạn đã đóng góp cho hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-green-50 px-4 py-2.5 rounded-xl border border-green-100 shadow-sm self-start md:self-auto">
            <FaTrophy className="text-green-500 text-xl" />
            <div className="flex flex-col">
              <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Đóng góp thành công</span>
              <span className="text-sm font-black text-green-800 leading-none mt-0.5">{totalApproved} địa điểm</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên địa điểm..." 
              className="w-full pl-11 pr-16 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition text-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {appliedQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setAppliedQuery(''); setCurrentPage(0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded-md">
                Xóa
              </button>
            )}
            <button type="submit" className="hidden"></button>
          </form>
          
          <div className="shrink-0 w-full sm:w-56 relative px-1 pb-1">
            <select 
              value={statusFilter} onChange={handleStatusChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 transition text-sm appearance-none cursor-pointer font-medium text-gray-700"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ duyệt</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div></div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="empty" className="w-32 h-32 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{(appliedQuery || statusFilter) ? 'Không tìm thấy kết quả nào' : 'Bạn chưa gửi kiến nghị nào'}</h3>
            <p className="text-gray-500 mb-6">{(appliedQuery || statusFilter) ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.' : 'Hãy khám phá bản đồ và đóng góp những địa điểm thú vị nhé!'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 hover:border-purple-200 transition-colors">
                
                {/* Ảnh chính */}
                <div className="w-full md:w-40 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-50">
                  {item.thumbnailUrl ? (
                    <img src={`http://localhost:8080/hue-travel-map/images/${item.thumbnailUrl}`} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500" onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${item.thumbnailUrl}`)} alt="thumb"/>
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Image</div>}
                </div>

                {/* Thông tin */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-lg text-purple-900 flex items-center gap-2 pr-4">
                        <div className="w-7 h-7 rounded-full bg-purple-800 flex items-center justify-center shrink-0 shadow-sm">
                          {getCategoryIcon(item.category?.id)}
                        </div>
                        {item.name}
                      </h3>
                      
                      {/* TRẠNG THÁI VÀ NÚT XÓA TRÊN MOBILE */}
                      <div className="md:hidden flex items-center gap-2">
                        {renderStatus(item.status)}
                        {item.status !== 'APPROVED' && (
                          <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-all" title="Xóa kiến nghị">
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-[12px] text-gray-500 font-medium mb-3">
                      {/* THAY ICON TAG BẰNG ICON DANH MỤC Ở ĐÂY */}
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category?.id, "text-purple-400 text-[13px]")} 
                        {item.category?.name}
                      </span>
                      <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-red-400"/> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span>
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-blue-400"/> {new Date(item.createdDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 italic">"{item.description || 'Không có mô tả'}"</p>
                  </div>

                  {item.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {item.images.map(img => (
                        <img key={img.id} src={`http://localhost:8080/hue-travel-map/images/${img.url}`} className="w-10 h-10 object-cover rounded-lg border border-gray-100 cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all" onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)} alt="sub"/>
                      ))}
                    </div>
                  )}
                </div>

                {/* TRẠNG THÁI VÀ NÚT XÓA TRÊN DESKTOP */}
                <div className="hidden md:flex flex-col items-end justify-between shrink-0 py-1">
                  {renderStatus(item.status)}
                  {item.status !== 'APPROVED' && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all" title="Xóa kiến nghị">
                      <FaTrash />
                    </button>
                  )}
                </div>

              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-10 pb-10">
                <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaAngleDoubleLeft size={12}/></button>
                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaChevronLeft size={10}/></button>
                <div className="flex gap-2">{renderPageNumbers()}</div>
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaChevronRight size={10}/></button>
                <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"><FaAngleDoubleRight size={12}/></button>
              </div>
            )}
          </div>
        )}
      </main>

      {fullscreenImage && (
        <div className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition"><IoClose size={35}/></button>
          <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="full" />
        </div>
      )}
    </div>
  );
}

export default MySuggestionsPage;