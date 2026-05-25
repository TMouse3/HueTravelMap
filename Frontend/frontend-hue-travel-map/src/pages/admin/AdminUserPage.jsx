import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaLock, FaUnlock, FaUserShield, FaUser, 
  FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaFilter
} from 'react-icons/fa';
import { userService } from '../../services/userService';
import { getInitial } from '../../utils/stringUtils';

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Lấy email admin hiện tại để ẩn nút tự khóa chính mình
  const currentAdmin = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAllUsersAdmin(currentPage, 10, appliedQuery, statusFilter);
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, appliedQuery, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setAppliedQuery(searchQuery);
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (id, name, currentStatus) => {
    const actionName = currentStatus ? 'KHÓA' : 'MỞ KHÓA';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản của "${name}"?`)) {
      try {
        await userService.toggleUserStatus(id);
        fetchUsers(); // Tải lại danh sách sau khi thao tác thành công
      } catch (err) {
        alert(err.response?.data?.error || 'Có lỗi xảy ra khi thực hiện!');
      }
    }
  };

  // Nút phân trang
  const renderPageNumbers = () => {
    const pageIndices = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pageIndices.push(i);
    } else {
      pageIndices.push(0);
      let left = Math.max(1, currentPage - 1);
      let right = Math.min(totalPages - 2, currentPage + 1);
      if (currentPage === 0) right = 2;
      if (currentPage === totalPages - 1) left = totalPages - 3;
      if (left > 1) pageIndices.push('...');
      for (let i = left; i <= right; i++) pageIndices.push(i);
      if (right < totalPages - 2) pageIndices.push('...');
      pageIndices.push(totalPages - 1);
    }

    return pageIndices.map((item, index) => {
      if (item === '...') {
        return <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold tracking-widest">...</span>;
      }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#430a75]">Quản lý tài khoản</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và kiểm soát quyền truy cập của người dùng hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* THANH TÌM KIẾM VÀ LỌC */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo Tên hoặc Email..." 
              className="w-full pl-11 pr-16 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {appliedQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setAppliedQuery(''); setCurrentPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-bold transition">
                Xóa
              </button>
            )}
            <button type="submit" className="hidden"></button>
          </form>

          {/* Dropdown Lọc trạng thái */}
          <div className="w-full md:w-56 relative">
            <select 
              value={statusFilter} 
              onChange={e => {
                setStatusFilter(e.target.value); 
                setCurrentPage(0);
              }} 
              className="w-full px-11 py-3 rounded-2xl border border-gray-200 outline-none appearance-none text-sm font-bold text-gray-600 bg-white focus:ring-2 focus:ring-purple-400 transition"
            >
               <option value="">Tất cả trạng thái</option>
               <option value="true">Đang hoạt động</option>
               <option value="false">Đã bị khóa</option>
            </select>
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-700"/>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 w-16">ID</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-20 text-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin mx-auto"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500 font-bold">Không tìm thấy tài khoản nào.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`transition-colors align-middle hover:bg-purple-50/30 ${!u.isActive ? 'bg-red-50/20 opacity-80' : ''}`}>
                    {/* CỘT ID */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">#{u.id}</td>

                    {/* CỘT NGƯỜI DÙNG (Avatar + Tên + Email) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-100 p-0.5 shadow-sm shrink-0">
                          {u.avatarUrl ? (
                            <img src={`http://localhost:8080/hue-travel-map/images/${u.avatarUrl}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg shadow-inner">
                              {getInitial(u.fullName)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-[15px] leading-tight ${!u.isActive ? 'text-gray-500 line-through' : 'text-[#430a75]'}`}>
                            {u.fullName}
                          </span>
                          <span className="text-[12px] text-gray-500 font-medium mt-0.5">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* CỘT ROLE */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${u.role === 'ADMIN' ? 'bg-[#2e0052] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'ADMIN' ? <FaUserShield size={12}/> : <FaUser size={12}/>}
                        {u.role}
                      </span>
                    </td>

                    {/* CỘT TRẠNG THÁI */}
                    <td className="px-6 py-4 text-center">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          <div className="w-2 h-2 rounded-full bg-red-500"/> Bị khóa
                        </span>
                      )}
                    </td>

                    {/* CỘT CHỨC NĂNG (NÚT BAN/UNBAN) */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {u.email === currentAdmin?.email ? (
                          <span className="text-[10px] text-gray-400 font-bold uppercase italic bg-gray-50 px-2 py-1 rounded">Bạn</span>
                        ) : u.isActive ? (
                          <button 
                            onClick={() => handleToggleStatus(u.id, u.fullName, u.isActive)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm"
                            title="Khóa tài khoản này"
                          >
                            <FaLock size={12}/> Khóa
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(u.id, u.fullName, u.isActive)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm"
                            title="Mở khóa tài khoản"
                          >
                            <FaUnlock size={12}/> Mở khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
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
    </div>
  );
}

export default AdminUserPage;