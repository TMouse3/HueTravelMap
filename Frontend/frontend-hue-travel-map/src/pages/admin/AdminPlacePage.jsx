import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, 
  FaFilter, FaEye, FaEyeSlash, FaMapMarkerAlt, 
  FaAngleDoubleLeft, FaAngleDoubleRight 
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5'; // Cần để làm nút Tắt cho Modal ảnh
import { placeService } from '../../services/placeService';
import { categoryService } from '../../services/categoryService';
import PlaceAdminModal from '../../components/modals/PlaceAdminModal';
import { getCategoryIcon } from '../../utils/mapUtils'; // Thêm thư viện gọi Icon

function AdminPlacePage() {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  
  // Thêm State để lưu ảnh đang được chọn xem phóng to
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const res = await placeService.getAllPlacesAdmin(currentPage, 10, appliedName, selectedCat);
      setPlaces(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchPlaces();
    const fetchCats = async () => {
      const res = await categoryService.getAllCategories();
      setCategories(res.data);
    };
    fetchCats();
  }, [currentPage, appliedName, selectedCat]);

  const handleToggleStatus = async (id) => {
    try {
      await placeService.toggleStatus(id);
      fetchPlaces();
    } catch (err) { alert('Lỗi đổi trạng thái!'); }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa vĩnh viễn địa điểm "${name}"? Các bài check-in liên quan cũng sẽ bị mất!`)) {
      try {
        await placeService.deletePlace(id);
        fetchPlaces();
      } catch (err) { alert(err.response?.data?.error || 'Lỗi khi xóa!'); }
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
          <h1 className="text-2xl font-black text-[#430a75]">Quản lý địa điểm</h1>
          <p className="text-gray-500 text-sm">Quản lý toàn bộ các điểm đến trên bản đồ Hue Travel Map</p>
        </div>
        <button onClick={() => { setEditingPlace(null); setIsModalOpen(true); }} className="px-6 py-3 bg-[#430a75] text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2">
          <FaPlus /> Thêm địa điểm
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input type="text" placeholder="Tìm tên địa điểm..." value={searchName} onChange={e=>setSearchName(e.target.value)} onKeyDown={e=>e.key==='Enter' && setAppliedName(searchName)} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none transition text-sm" />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          </div>
          <div className="w-full md:w-64 relative">
            <select value={selectedCat} onChange={e=>{setSelectedCat(e.target.value); setCurrentPage(0);}} className="w-full px-11 py-3 rounded-2xl border border-gray-200 outline-none appearance-none text-sm font-bold text-gray-600">
               <option value="">Tất cả loại</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-700"/>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Địa điểm & Hình ảnh</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="p-20 text-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : places.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500 font-bold">Không tìm thấy địa điểm nào.</td></tr>
              ) : places.map(p => (
                <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                  
                  {/* CỘT THÔNG TIN ĐỊA ĐIỂM + DANH SÁCH ẢNH */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      
                      {/* Khối chứa ảnh chính và dãy ảnh phụ */}
                      <div className="flex flex-col gap-1.5 shrink-0 w-[72px]">
                        <img 
                          src={`http://localhost:8080/hue-travel-map/images/${p.thumbnailUrl}`} 
                          className="w-[72px] h-[72px] rounded-2xl object-cover shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
                          onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${p.thumbnailUrl}`)}
                          title="Ảnh đại diện"
                        />
                        {p.images && p.images.length > 0 && (
                          <div className="flex gap-1 justify-start">
                            {p.images.map(img => (
                              <img 
                                key={img.id}
                                src={`http://localhost:8080/hue-travel-map/images/${img.url}`} 
                                className="w-5 h-5 rounded-md object-cover shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-400 transition opacity-80 hover:opacity-100"
                                onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}
                                title="Ảnh phụ"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Khối chứa tên và tọa độ */}
                      <div className="flex flex-col py-1">
                        <span className="font-black text-[#430a75] text-[15px]">{p.name}</span>
                        <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1 mt-1 uppercase">
                          <FaMapMarkerAlt/> {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                        </span>
                      </div>

                    </div>
                  </td>
                  
                  {/* CỘT LOẠI KÈM ICON */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase shadow-sm">
                      {getCategoryIcon(p.category?.id, "text-purple-700 text-[13px]")}
                      {p.category?.name}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                     {p.isActive 
                      ? <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Đang hiện</span>
                      : <span className="flex items-center gap-1.5 text-gray-400 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-gray-300"/> Đang ẩn</span>
                     }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                       <button onClick={()=>handleToggleStatus(p.id)} className={`p-2 rounded-xl transition ${p.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={p.isActive ? 'Ẩn' : 'Hiện'}>
                          {p.isActive ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
                       </button>
                       <button onClick={()=>{setEditingPlace(p); setIsModalOpen(true);}} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition"><FaEdit size={18}/></button>
                       <button onClick={()=>handleDelete(p.id, p.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"><FaTrash size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Table (Phân trang) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50/50">
            <button 
              onClick={() => setCurrentPage(0)} 
              disabled={currentPage === 0} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"
            >
              <FaAngleDoubleLeft size={12}/>
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
              disabled={currentPage === 0} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"
            >
              <FaChevronLeft size={10}/>
            </button>
            
            <div className="flex gap-1.5">
              {renderPageNumbers()}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} 
              disabled={currentPage === totalPages - 1} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"
            >
              <FaChevronRight size={10}/>
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages - 1)} 
              disabled={currentPage === totalPages - 1} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-purple-700 disabled:opacity-30 transition"
            >
              <FaAngleDoubleRight size={12}/>
            </button>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && <PlaceAdminModal onClose={()=>setIsModalOpen(false)} onSuccess={()=>{setIsModalOpen(false); fetchPlaces();}} editingPlace={editingPlace}/>}

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

export default AdminPlacePage;