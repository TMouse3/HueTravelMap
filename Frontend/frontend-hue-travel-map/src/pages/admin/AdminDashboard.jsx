import React, { useState, useEffect } from 'react';
import { FaUsers, FaMapMarkedAlt, FaCheckCircle, FaChartLine, FaTrophy, FaCalendarDay, FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { suggestionService } from '../../services/suggestionService';
import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [visitChart, setVisitChart] = useState([]);
  const [userChart, setUserChart] = useState([]);
  const [checkinChart, setCheckinChart] = useState([]);
  
  const [years, setYears] = useState({ visit: new Date().getFullYear(), user: new Date().getFullYear(), checkin: new Date().getFullYear() });
  const [loading, setLoading] = useState(true);
  
  // State quản lý Tab xếp hạng
  const [topTab, setTopTab] = useState('month'); // 'month' hoặc 'allTime'

  const [fullscreenImage, setFullscreenImage] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await dashboardService.getSummary();
      setSummary(res.data);
      // Gán năm mặc định là năm gần nhất có dữ liệu (nếu có)
      if (res.data.availableVisitYears?.length > 0) setYears(prev => ({...prev, visit: res.data.availableVisitYears[0]}));
      if (res.data.availableUserYears?.length > 0) setYears(prev => ({...prev, user: res.data.availableUserYears[0]}));
      if (res.data.availableCheckinYears?.length > 0) setYears(prev => ({...prev, checkin: res.data.availableCheckinYears[0]}));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const init = async () => {
      await fetchSummary();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { if (summary) loadVisitChart(); }, [years.visit, summary]);
  useEffect(() => { if (summary) loadUserChart(); }, [years.user, summary]);
  useEffect(() => { if (summary) loadCheckinChart(); }, [years.checkin, summary]);

  const loadVisitChart = async () => { const res = await dashboardService.getVisitChart(years.visit); setVisitChart(res.data); };
  const loadUserChart = async () => { const res = await dashboardService.getUserChart(years.user); setUserChart(res.data); };
  const loadCheckinChart = async () => { const res = await dashboardService.getCheckinChart(years.checkin); setCheckinChart(res.data); };

  // --- XỬ LÝ NHANH KIẾN NGHỊ ---
  const handleApprove = async (id) => {
    if (window.confirm('Duyệt kiến nghị này thành địa điểm mới?')) {
      try {
        await suggestionService.approveSuggestion(id);
        fetchSummary(); // Tải lại Dashboard sau khi duyệt
      } catch (err) { alert(err.response?.data?.error || 'Lỗi duyệt!'); }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Bạn muốn từ chối kiến nghị này?')) {
      try {
        await suggestionService.rejectSuggestion(id);
        fetchSummary();
      } catch (err) { alert(err.response?.data?.error || 'Lỗi từ chối!'); }
    }
  };

  if (loading || !summary) return <div className="p-20 text-center flex flex-col items-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin mb-4"></div>Đang tải dữ liệu...</div>;

  const todayString = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const StatCard = ({ title, today, month, total, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>{icon}</div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
          <h2 className="text-3xl font-black text-gray-800">{total.toLocaleString()}</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Hôm nay</p>
          <p className="text-sm font-black text-green-600">+{today}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Tháng này</p>
          <p className="text-sm font-black text-blue-600">+{month}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#430a75]">Bảng thống kê</h1>
          <p className="text-gray-500 font-bold mt-1 bg-white px-4 py-1.5 rounded-lg shadow-sm inline-block border border-gray-100">
            Hôm nay: <span className="text-purple-700">{todayString}</span>
          </p>
        </div>
      </header>

      {/* 1. THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Lượt truy cập" today={summary.todayVisits} month={summary.monthVisits} total={summary.totalVisits} icon={<FaChartLine size={20}/>} colorClass="bg-blue-500" />
        <StatCard title="Người dùng" today={summary.todayUsers} month={summary.monthUsers} total={summary.totalUsers} icon={<FaUsers size={20}/>} colorClass="bg-purple-500" />
        <StatCard title="Check-in" today={summary.todayCheckins} month={summary.monthCheckins} total={summary.totalCheckins} icon={<FaCheckCircle size={20}/>} colorClass="bg-amber-500" />
        
        {/* Thẻ Kiến nghị*/}
        <div className="bg-gradient-to-br from-[#430a75] to-purple-800 p-6 rounded-[32px] shadow-lg flex flex-col justify-between text-white relative overflow-hidden">
           <div className="z-10 flex justify-between items-start">
              <div>
                <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-1">Kiến nghị chờ duyệt</p>
                <h2 className="text-4xl font-black">{summary.pendingSuggestions}</h2>
              </div>
              {summary.pendingSuggestions > 0 && (
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              )}
           </div>
           <Link to="/admin/suggestions" className="z-10 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-center text-xs font-bold transition-colors border border-white/20 mt-4 backdrop-blur-sm">
              Quản lý tất cả
           </Link>
           <FaMapMarkedAlt className="absolute -right-4 -bottom-4 text-white/10 text-9xl pointer-events-none"/>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { id: 'visit', label: 'Lượt truy cập', data: visitChart, color: '#3b82f6', years: summary.availableVisitYears || [] },
          { id: 'user', label: 'Người dùng mới', data: userChart, color: '#a855f7', years: summary.availableUserYears || [] },
          { id: 'checkin', label: 'Lượt Check-in', data: checkinChart, color: '#f59e0b', years: summary.availableCheckinYears || [] }
        ].map(chart => (
          <div key={chart.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col h-[280px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest">{chart.label}</h3>
              {chart.years.length > 0 && (
                <select 
                  value={years[chart.id]} 
                  onChange={e => setYears({...years, [chart.id]: e.target.value})}
                  className="bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-black p-1.5 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer text-gray-600"
                >
                  {chart.years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>
              )}
            </div>
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`color-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#9ca3af'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}} />
                  <Area type="monotone" dataKey="value" stroke={chart.color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${chart.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BẢNG XẾP HẠNG & KIẾN NGHỊ NHANH */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* TOP ĐỊA ĐIỂM */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><FaTrophy size={18}/></div>
              <h3 className="text-lg font-black text-gray-800">Top 5 địa điểm</h3>
            </div>
            {/* TABS CHUYỂN ĐỔI */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={()=>setTopTab('week')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${topTab === 'week' ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tuần</button>
              <button onClick={()=>setTopTab('month')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${topTab === 'month' ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tháng</button>
              <button onClick={()=>setTopTab('allTime')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${topTab === 'allTime' ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tổng</button>
            </div>
          </div>

          <div className="space-y-5">
            {summary[topTab === 'week' ? 'top5Week' : topTab === 'month' ? 'top5Month' : 'top5AllTime'].length === 0 ? (
              <p className="text-center text-gray-400 text-sm font-medium py-10">Chưa có dữ liệu check-in để xếp hạng.</p>
            ) : (
              summary[topTab === 'week' ? 'top5Week' : topTab === 'month' ? 'top5Month' : 'top5AllTime'].map((p, i) => {
                return (
                  <div key={p.placeId} className="flex items-center gap-4 group">
                    <span className="w-5 text-center text-sm font-black text-amber-200 group-hover:text-amber-500 transition-colors">{i+1}</span>
                    <img 
                      src={`http://localhost:8080/hue-travel-map/images/${p.thumbnailUrl}`} 
                      className="w-11 h-11 rounded-xl object-cover shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                      onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${p.thumbnailUrl}`)}
                      alt="thumbnail"
                    />
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800 text-[13px] leading-tight mb-1">{p.placeName}</p>
                      {/* Thay Progress Bar bằng Sao */}
                      <div className="flex items-center text-yellow-400 text-[10px]">
                        {[...Array(5)].map((_, idx) => <FaStar key={idx} className={idx < Math.round(p.averageRating) ? "text-yellow-400" : "text-gray-200"}/>)}
                        <span className="text-amber-600 font-bold ml-1.5 text-[11px]">{p.averageRating}</span>
                      </div>
                    </div>
                    <div className="w-12 text-right">
                       <span className="text-xs font-black text-purple-900">{p.checkinCount}</span>
                       <span className="text-[9px] text-gray-400 block uppercase">lượt</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* KIẾN NGHỊ TRONG NGÀY (QUICK ACTIONS) */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><FaCalendarDay size={18}/></div>
              <h3 className="text-lg font-black text-gray-800">Kiến nghị hôm nay</h3>
            </div>
            <Link to="/admin/suggestions" className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline">Xem tất cả</Link>
          </div>

          <div className="overflow-x-auto">
            {summary.todaySuggestions.length === 0 ? (
               <div className="py-10 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                 Hôm nay chưa có ai gửi kiến nghị địa điểm mới.
               </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr><th className="pb-3 px-2">Địa điểm</th><th className="pb-3 text-center">Thao tác nhanh</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.todaySuggestions.map(s => (
                    <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                           <img 
                             src={`http://localhost:8080/hue-travel-map/images/${s.thumbnailUrl}`} 
                             className="w-9 h-9 rounded-lg object-cover shadow-sm shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                             onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${s.thumbnailUrl}`)}
                             alt="thumbnail"
                           />
                           <div>
                             <p className="font-bold text-gray-800 text-[13px] leading-tight">{s.name}</p>
                             <p className="text-[10px] text-gray-500 font-medium">Bởi: {s.userFullName}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {s.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={()=>handleApprove(s.id)} className="w-7 h-7 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg flex items-center justify-center transition-colors" title="Duyệt nhanh"><FaCheck size={12}/></button>
                            <button onClick={()=>handleReject(s.id)} className="w-7 h-7 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-colors" title="Từ chối"><FaTimes size={12}/></button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${s.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {s.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
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

export default AdminDashboard;