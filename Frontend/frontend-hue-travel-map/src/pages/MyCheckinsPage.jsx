import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaStar, FaTrash, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import { checkinService } from '../services/checkinService';
import { getCategoryIcon } from '../utils/mapUtils';

function MyCheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Thêm State lưu thành tích
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [totalVisitedPlaces, setTotalVisitedPlaces] = useState(0);

  // States cho Lọc và Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchMyCheckins = async () => {
    setIsLoading(true);
    if (currentPage > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await checkinService.getMyHistory(currentPage, 10, appliedQuery, ratingFilter);
      
      // Móc dữ liệu theo cấu trúc DTO mới
      setCheckins(res.data.checkinsPage.content); 
      setTotalPages(res.data.checkinsPage.totalPages);
      setTotalCheckins(res.data.totalCheckins);
      setTotalVisitedPlaces(res.data.totalVisitedPlaces);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCheckins();
  }, [currentPage, appliedQuery, ratingFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setAppliedQuery(searchQuery);
  };

  const handleRatingChange = (e) => {
    setRatingFilter(e.target.value);
    setCurrentPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.')) {
      try {
        await checkinService.deleteCheckin(id);
        fetchMyCheckins();
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
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-5xl animate-fade-in">
        
        {/* HEADER VÀ THÀNH TÍCH CHECK-IN */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center text-purple-700 shadow-sm border border-gray-100 hover:bg-purple-50 transition">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[#2e0052]">Nhật ký Check-in</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Nơi lưu giữ những kỷ niệm của bạn</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 self-start md:self-auto">
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm">
              <FaMapMarkerAlt className="text-blue-500 text-xl" />
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Đã đặt chân đến</span>
                <span className="text-sm font-black text-blue-800 leading-none mt-0.5">{totalVisitedPlaces} địa điểm</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 shadow-sm">
              <FaStar className="text-amber-500 text-xl" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Tổng đánh giá</span>
                <span className="text-sm font-black text-amber-800 leading-none mt-0.5">{totalCheckins} lần</span>
              </div>
            </div>
          </div>
        </div>

        {/* BỘ TÌM KIẾM VÀ LỌC */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên địa điểm (Nhấn Enter)..." 
              className="w-full pl-11 pr-16 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {appliedQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setAppliedQuery(''); setCurrentPage(0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded-md">
                Xóa
              </button>
            )}
            <button type="submit" className="hidden"></button>
          </form>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1 pt-1">
            {[ { val: '', lbl: 'Tất cả sao' }, { val: '5', lbl: '⭐⭐⭐⭐⭐' }, { val: '4', lbl: '⭐⭐⭐⭐' }, { val: '3', lbl: '⭐⭐⭐' }, { val: '2', lbl: '⭐⭐' }, { val: '1', lbl: '⭐' }
            ].map(star => (
              <button key={star.val} onClick={() => handleRatingChange({ target: { value: star.val } })} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${ratingFilter === star.val ? 'bg-[#2e0052] text-white shadow-md transform scale-105' : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200'}`}>
                {star.lbl}
              </button>
            ))}
          </div>
        </div>

        {/* NỘI DUNG */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div></div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="empty" className="w-32 h-32 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{(appliedQuery || ratingFilter) ? 'Không tìm thấy kết quả' : 'Bạn chưa có check-in nào'}</h3>
            <p className="text-gray-500 mb-6">{(appliedQuery || ratingFilter) ? 'Hãy thử đổi từ khóa hoặc bộ lọc' : 'Hãy ghé thăm các địa điểm và để lại đánh giá nhé!'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkins.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:border-purple-200 transition-colors relative group">
                
                <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all z-10" title="Xóa check-in">
                  <FaTrash />
                </button>

                {/* 1. TÊN ĐỊA ĐIỂM + ICON */}
                <h3 className="font-black text-lg text-purple-900 flex items-center gap-2 pr-10">
                  <div className="w-7 h-7 rounded-full bg-purple-800 flex items-center justify-center shrink-0 shadow-sm">
                    {getCategoryIcon(item.categoryId)}
                  </div>
                  {item.placeName}
                </h3>
                
                {/* 2. SỐ SAO + NGÀY THÁNG */}
                <div className="flex items-center gap-4 mt-1 mb-3">
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className={i < item.rating ? "text-yellow-400" : "text-gray-200"}/>)}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <FaCalendarAlt /> {new Date(item.createdDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 3. NỘI DUNG CONTENT */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3">"{item.content}"</p>

                {/* 4. ẢNH TỪ TRÊN XUỐNG DƯỚI */}
                {item.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-gray-50 mt-auto">
                    {item.images.map(img => (
                      <img key={img.id} src={`http://localhost:8080/hue-travel-map/images/${img.url}`} className="w-12 h-12 object-cover rounded-lg border border-gray-100 cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all" alt="checkin" onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}/>
                    ))}
                  </div>
                )}
                
              </div>
            ))}

            {/* Phân trang */}
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

export default MyCheckinsPage;