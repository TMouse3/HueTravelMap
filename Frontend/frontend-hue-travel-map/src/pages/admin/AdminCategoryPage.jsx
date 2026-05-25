import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { categoryService } from '../../services/categoryService';

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');

  // States Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = Thêm mới, có data = Sửa
  const [categoryName, setCategoryName] = useState('');

  // 1. Fetch dữ liệu
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getAllCategoriesAdmin(currentPage, 10, appliedQuery);
      setCategories(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, appliedQuery]);

  // 2. Xử lý Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setAppliedQuery(searchQuery);
  };

  // 3. Xử lý Mở Modal
  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsModalOpen(true);
  };

  // 4. Xử lý Lưu (Thêm/Sửa)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name: categoryName });
      } else {
        await categoryService.createCategory({ name: categoryName });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra!');
    }
  };

  // 5. Xử lý Xóa
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.error || 'Xóa thất bại!');
      }
    }
  };

  // Render Nút Phân Trang
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
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#430a75]">Quản lý loại địa điểm</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các danh mục địa (loại) điểm trên bản đồ</p>
        </div>
        
        <button onClick={openAddModal} className="px-5 py-2.5 bg-[#430a75] hover:bg-purple-900 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Table (Search) */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm danh mục..." 
              className="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-sm"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            {appliedQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setAppliedQuery(''); setCurrentPage(0); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded font-bold transition">
                Xóa
              </button>
            )}
            <button type="submit" className="hidden"></button>
          </form>
        </div>

        {/* Body Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Tên Danh Mục</th>
                <th className="p-4 font-bold text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="3" className="p-8 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">Không tìm thấy danh mục nào.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 text-sm font-semibold text-gray-600">#{cat.id}</td>
                    <td className="p-4 text-sm font-bold text-[#430a75]">{cat.name}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Sửa">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Table (Pagination) */}
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

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl mx-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"><IoClose size={20}/></button>
            <h2 className="text-xl font-black text-[#430a75] mb-4">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
            
            <form onSubmit={handleSave}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-2">Tên danh mục</label>
                <input 
                  type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required autoFocus
                  placeholder="Nhập tên..." 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#430a75] hover:bg-purple-900 text-white font-bold rounded-xl shadow-md transition text-sm">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategoryPage;