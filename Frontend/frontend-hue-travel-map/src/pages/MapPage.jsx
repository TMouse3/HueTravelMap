import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, Polyline, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { IoClose } from "react-icons/io5";
import { 
  FaSearch, FaStar, FaMapMarkerAlt, FaRoute, 
  FaLandmark, FaTree, FaCoffee, FaUtensils, FaUmbrellaBeach, 
  FaVihara, FaChurch, FaSchool, FaShoppingBag, FaHotel, FaImage,
  FaFilter, FaTrophy
} from 'react-icons/fa';

import Navbar from '../components/Navbar';
import { placeService } from '../services/placeService';
import { categoryService } from '../services/categoryService';
import { getInitial } from '../utils/stringUtils';
import { getCategoryIcon } from '../utils/mapUtils';
import { translateManeuver } from '../utils/mapUtils';
import { checkinService } from '../services/checkinService';

import CheckinModal from '../components/modals/CheckinModal';
import LoginModal from '../components/modals/LoginModal';
import RegisterModal from '../components/modals/RegisterModal';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import ProfileModal from '../components/modals/ProfileModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import RouteStepsModal from '../components/modals/RouteStepsModal';
import SuggestionModal from '../components/modals/SuggestionModal';
import AIChatbox from '../components/AIChatbox';

const DAI_NOI_CENTER = [16.4678, 107.5788];

const createCustomIcon = (place) => {
  const htmlContent = renderToStaticMarkup(
    <div className="relative group cursor-pointer flex flex-col items-center">
      
      {/* BOX THÔNG TIN */}
      <div 
        style={{ display: 'flex', alignItems: 'center', width: '220px' }} 
        className="bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-md border border-gray-200 z-10 transition-colors group-hover:border-purple-500"
      >
        {/* ẢNH: Đã thêm minWidth để khóa cứng, không bị ép méo hoặc tràn */}
        <div style={{ width: '48px', height: '48px', minWidth: '48px', flexShrink: 0, overflow: 'hidden', borderRadius: '8px' }}>
          <img 
            src={`http://localhost:8080/hue-travel-map/images/${place.thumbnailUrl}`} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        
        {/* CHỮ */}
        <div style={{ marginLeft: '10px', flex: 1, minWidth: 0, overflow: 'hidden' }} className="text-left">
          {/* Ép chữ chạy 1 dòng, dài quá thì cắt thành dấu ... */}
          <span 
            style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} 
            className="text-[13px] font-bold text-gray-800"
          >
            {place.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
            <FaStar className="text-[11px] text-yellow-500" />
            <span className="text-[12px] text-gray-700 ml-1 font-semibold">{place.averageRating}</span>
          </div>
        </div>
      </div>
      
      {/* Mũi tên và Icon danh mục */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white z-10 -mt-[1px]"></div>
      <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20 -mt-1">
        {getCategoryIcon(place.category?.id)}
      </div>
    </div>
  );
  
  return L.divIcon({ html: htmlContent, className: 'custom-marker', iconSize: [220, 90], iconAnchor: [110, 85] });
};

function MapPage() {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeModal, setActiveModal] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [placeDetail, setPlaceDetail] = useState(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  
  // State quản lý việc xem ảnh phóng to
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // State lưu tọa độ đường đi để vẽ
  const [routePath, setRoutePath] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // State lưu các bước chi tiết của đường đi
  const [routeSteps, setRouteSteps] = useState(null);
  const [showStepsModal, setShowStepsModal] = useState(false);

  // Thêm mapRef để điều khiển bản đồ
  const mapRef = useRef(null); 
  
  // State quản lý ô tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  const [clickedLocation, setClickedLocation] = useState(null);

  const [isTopPlacesOpen, setIsTopPlacesOpen] = useState(false);
  const [topPlacesData, setTopPlacesData] = useState([]);
  const [topPlacesTime, setTopPlacesTime] = useState('week'); // week, month, allTime
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, catsRes] = await Promise.all([
          placeService.getAllPlaces(selectedCategory),
          categoryService.getAllCategories()
        ]);
        setPlaces(placesRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error("Lỗi:", err);
      }
    };
    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    if (isTopPlacesOpen) {
      const fetchTop = async () => {
        setIsLoadingTop(true);
        try {
          const res = await placeService.getTopPlaces(topPlacesTime);
          setTopPlacesData(res.data);
        } catch(e) { console.error(e); }
        setIsLoadingTop(false);
      };
      fetchTop();
    }
  }, [isTopPlacesOpen, topPlacesTime]);

  const handleMarkerClick = async (id) => {
    try {
      setClickedLocation(null);
      setIsSidebarOpen(true);
      setPlaceDetail(null); 
      const res = await placeService.getPlaceById(id);
      setPlaceDetail(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckinClick = () => {
    const token = localStorage.getItem('token');
    
    // NẾU CHƯA ĐĂNG NHẬP -> Mở form Đăng nhập
    if (!token) {
      return setActiveModal('login');
    }

    // NẾU ĐÃ ĐĂNG NHẬP -> Kiểm tra GPS
    if (!navigator.geolocation) {
      return alert('Trình duyệt của bạn không hỗ trợ định vị GPS!');
    }

    setIsVerifying(true);
    
    // Lấy tọa độ hiện tại của thiết bị
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // const userLat = placeDetail.lat
        // const userLng = placeDetail.lng

        try {
          // Gọi API verify-location
          const res = await checkinService.verifyLocation(placeDetail.id, userLat, userLng);
          
          if (res.data === true) {
            // Hợp lệ -> Lưu tọa độ và mở Modal Check-in
            setUserLocation({ lat: userLat, lng: userLng });
            setActiveModal('checkin');
          } else {
            alert('Bạn đang ở quá xa địa điểm này để có thể Check-in! Vui lòng ở trong bán kính 100m và thử lại.');
          }
        } catch (err) {
          alert('Lỗi khi xác minh vị trí với hệ thống.');
        } finally {
          setIsVerifying(false);
        }
      },
      (error) => {
        setIsVerifying(false);
        alert('Vui lòng cấp quyền truy cập vị trí cho trình duyệt để sử dụng tính năng này!');
      },
      { enableHighAccuracy: true } // Yêu cầu GPS độ chính xác cao
    );
  };

  const handleNavigate = () => {
    if (!navigator.geolocation) {
      return alert('Trình duyệt không hỗ trợ định vị!');
    }

    setIsRouting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const startLat = position.coords.latitude;
        const startLng = position.coords.longitude;
        const endLat = placeDetail.lat;
        const endLng = placeDetail.lng;

        try {
          // Gọi API của OSRM (Service lái xe - driving)
          // format: {lng},{lat};{lng},{lat}
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
          );
          const data = await response.json();

          if (data.code === 'Ok') {
            // Tọa độ đường đi nằm trong data.routes[0].geometry.coordinates
            // OSRM trả về dạng [lng, lat], Leaflet cần dạng [lat, lng] nên phải đảo ngược
            const points = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePath(points);
            setRouteSteps(data.routes[0].legs[0].steps);
            
            // Tự động thu phóng bản đồ để vừa vặn với đường đi
            // map.fitBounds(points); 
          } else {
            alert('Không tìm thấy đường đi khả thi!');
          }
        } catch (err) {
          console.error("Lỗi routing:", err);
          alert('Lỗi kết nối đến dịch vụ bản đồ.');
        } finally {
          setIsRouting(false);
        }
      },
      (error) => {
        setIsRouting(false);
        alert('Vui lòng bật định vị để sử dụng tính năng này!');
      }
    );
  };

  // Lọc 5 địa điểm khớp với từ khóa (nếu ô tìm kiếm không rỗng)
  const filteredSearchPlaces = searchQuery 
    ? places
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5) // Chỉ lấy tối đa 5 kết quả
    : [];

  // Hàm xử lý khi click vào 1 kết quả tìm kiếm
  const handleFlyToPlace = (place) => {
    setSearchQuery(''); 
    handleMarkerClick(place.id); 
    
    // Đóng bảng Top 5 khi đã chọn được địa điểm
    setIsTopPlacesOpen(false);

    if (mapRef.current) {
      mapRef.current.flyTo([place.lat, place.lng], 16, {
        duration: 1.5
      });
    }
  };

  const renderedMarkers = useMemo(() => {
    return places.map((place) => (
      <Marker 
        key={place.id} 
        position={[place.lat, place.lng]} 
        icon={createCustomIcon(place)}
        eventHandlers={{ click: () => handleMarkerClick(place.id) }}
      />
    ));
  }, [places]);

  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click(e) {
        onMapClick(e.latlng);
      },
    });
    return null;
  };

  const handleMapClick = (latlng) => {
    setClickedLocation(latlng);
    // Ẩn sidebar chi tiết địa điểm đi cho đỡ rối
    setIsSidebarOpen(false); 
  };

  return (
    <div className="h-screen w-full relative flex flex-col overflow-hidden bg-gray-50">
      <Navbar onOpenModal={setActiveModal} />

      {/* --- RENDER CÁC MODAL DỰA VÀO STATE --- */}
      {activeModal === 'login' && (
        <LoginModal 
          onClose={() => setActiveModal(null)} 
          onSwitchModal={setActiveModal} 
        />
      )}
      
      {activeModal === 'register' && (
        <RegisterModal 
          onClose={() => setActiveModal(null)} 
          onSwitchModal={setActiveModal} 
        />
      )}

      {activeModal === 'forgot-password' && (
        <ForgotPasswordModal onClose={() => setActiveModal(null)} onSwitchModal={setActiveModal} />
      )}

      {activeModal === 'profile' && (
        <ProfileModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'change-password' && (
        <ChangePasswordModal onClose={() => setActiveModal(null)}
          onSwitchModal={setActiveModal} 
        />
      )}

      {activeModal === 'checkin' && (
        <CheckinModal 
          onClose={() => setActiveModal(null)} 
          place={placeDetail}
          userLat={userLocation.lat}
          userLng={userLocation.lng}
          onSuccess={() => {
            setActiveModal(null);
            alert('Check-in thành công!');
            // Gọi lại hàm lấy dữ liệu Place để cập nhật bài đánh giá mới nhất lên Sidebar
            handleMarkerClick(placeDetail.id); 
          }}
        />
      )}
      {activeModal === 'suggestion' && clickedLocation && (
        <SuggestionModal 
          onClose={() => {
            setActiveModal(null);
          }}
          lat={clickedLocation.lat}
          lng={clickedLocation.lng}
          categories={categories}
          onSuccess={() => {
            setActiveModal(null);
            setClickedLocation(null);
            alert('Cảm ơn bạn! Kiến nghị đã được gửi và đang chờ quản trị viên phê duyệt.');
          }}
        />
      )}

      <div className="relative flex-grow h-full w-full"> 
        
        {/* THANH TÌM KIẾM & LỌC DANH MỤC */}
        <div className={`absolute top-24 left-0 right-0 z-[1000] flex flex-row justify-center items-center gap-4 px-8 md:px-12 pointer-events-none transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[400px]' : ''}`}>
          
          {/* Ô TÌM KIẾM */}
          <div className="relative w-full max-w-sm pointer-events-auto">
            <div className="relative shadow-lg rounded-full bg-white/95 backdrop-blur-md border border-gray-200">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
                <FaSearch className="text-purple-700 text-[16px]" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm địa điểm..." 
                className="w-full pl-11 pr-6 py-3.5 bg-transparent rounded-full text-[15px] outline-none transition-all text-gray-800 focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* DROPDOWN KẾT QUẢ TÌM KIẾM */}
            {searchQuery && (
              <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-1 z-[2000] animate-fade-in-down overflow-hidden">
                {filteredSearchPlaces.length > 0 ? (
                  filteredSearchPlaces.map(place => (
                    <div 
                      key={place.id} 
                      onClick={() => handleFlyToPlace(place)}
                      className="flex items-center gap-3 p-2.5 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors"
                    >
                      {/* Ảnh thu nhỏ */}
                      <img 
                        src={`http://localhost:8080/hue-travel-map/images/${place.thumbnailUrl}`} 
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-gray-100" 
                        alt={place.name} 
                      />
                      
                      {/* Tên và Đánh giá */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[14px] font-bold text-gray-800 truncate leading-tight">
                          {place.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <FaStar className="text-[11px] text-yellow-500 mr-1" />
                          <span className="text-[12px] text-gray-600 font-bold leading-none">{place.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-[14px] text-gray-500 text-center font-medium">Không tìm thấy địa điểm nào.</p>
                )}
              </div>
            )}
          </div>

          {/* NÚT DANH MỤC */}
          <div className="relative pointer-events-auto">
            <button 
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="px-6 py-3.5 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-full text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-purple-50 transition-colors"
            >
              <FaFilter className="text-purple-700" /> 
              <span className="hidden sm:block">{selectedCategory ? categories.find(c=>c.id === selectedCategory)?.name : 'Tất cả danh mục'}</span>
            </button>

            {/* Menu xổ xuống */}
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto z-[2000] animate-fade-in-down">
                <button 
                  onClick={() => { setSelectedCategory(null); setIsCategoryMenuOpen(false); }} 
                  className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  Tất cả địa điểm
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setIsCategoryMenuOpen(false); }}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${selectedCategory === cat.id ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedCategory === cat.id ? 'bg-purple-800' : 'bg-gray-200'}`}>
                       {getCategoryIcon(cat.id)}
                    </div>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NÚT TOP ĐỊA ĐIỂM */}
          <div className="relative pointer-events-auto">
            <button 
              onClick={() => setIsTopPlacesOpen(!isTopPlacesOpen)}
              className={`px-6 py-3.5 bg-white/90 backdrop-blur-md border shadow-lg rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${isTopPlacesOpen ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-700'}`}
            >
              <FaTrophy className="text-amber-500" /> 
              <span className="hidden sm:block">Top địa điểm</span>
            </button>
          </div>
        </div>

        {/* PANEL TOP 5 ĐỊA ĐIỂM */}
        {isTopPlacesOpen && (
          <div className="absolute top-24 right-4 md:right-8 z-[1000] w-full max-w-[320px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(75,0,130,0.15)] border border-gray-100 flex flex-col pointer-events-auto animate-fade-in-down overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
              <h3 className="font-black text-amber-800 flex items-center gap-2"><FaTrophy/> Bảng xếp hạng</h3>
              <button onClick={() => setIsTopPlacesOpen(false)} className="text-gray-400 hover:text-red-500"><IoClose size={20}/></button>
            </div>
            
            <div className="flex bg-gray-50 p-1 border-b border-gray-100">
              <button onClick={()=>setTopPlacesTime('week')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-colors ${topPlacesTime === 'week' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'}`}>Tuần này</button>
              <button onClick={()=>setTopPlacesTime('month')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-colors ${topPlacesTime === 'month' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'}`}>Tháng này</button>
              <button onClick={()=>setTopPlacesTime('allTime')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-colors ${topPlacesTime === 'allTime' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'}`}>Tất cả</button>
            </div>

            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">
              {isLoadingTop ? (
                 <div className="py-8 text-center"><div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div></div>
              ) : topPlacesData.length === 0 ? (
                 <p className="text-center text-gray-500 text-xs py-8 font-medium">Chưa có dữ liệu đánh giá.</p>
              ) : (
                topPlacesData.map((place, index) => (
                  <div key={place.id} onClick={() => handleFlyToPlace(place)} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-amber-50/50 rounded-xl transition-colors">
                    <span className={`w-5 text-center font-black ${index === 0 ? 'text-amber-500 text-lg' : index === 1 ? 'text-gray-400 text-base' : index === 2 ? 'text-amber-700 text-base' : 'text-gray-300 text-sm'}`}>{index + 1}</span>
                    <img src={`http://localhost:8080/hue-travel-map/images/${place.thumbnailUrl}`} className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-800 truncate group-hover:text-amber-700 transition-colors">{place.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-yellow-400 text-[9px]">
                            {[...Array(5)].map((_, idx) => <FaStar key={idx} className={idx < Math.round(place.averageRating) ? "text-yellow-400" : "text-gray-200"}/>)}
                          </div>
                          <span className="text-[11px] font-black text-amber-600">{place.averageRating}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">{place.totalCheckins} check-in</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SIDEBAR CHI TIẾT */}
        <aside className={`absolute top-24 bottom-6 left-4 md:left-8 z-[1100] w-full max-w-[380px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(75,0,130,0.15)] transition-transform duration-300 overflow-hidden flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
          {placeDetail ? (
            <div className="flex flex-col h-full relative">
              
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/50 transition shadow-sm">
                <IoClose size={22} />
              </button>

              <div className="overflow-y-auto flex-grow no-scrollbar">
                <img 
                  src={`http://localhost:8080/hue-travel-map/images/${placeDetail.thumbnailUrl}`} 
                  alt="" 
                  className="w-full h-60 object-cover cursor-pointer hover:opacity-95 transition-opacity" 
                  onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${placeDetail.thumbnailUrl}`)}
                />
                
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black text-purple-800 leading-tight pr-2">{placeDetail.name}</h2>
                    <button 
                      onClick={handleNavigate}
                      disabled={isRouting}
                      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition shadow-sm ${isRouting ? 'bg-gray-200 text-gray-400' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                      title="Dẫn đường đến đây"
                    >
                      <FaRoute size={18} className={isRouting ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="text-sm font-bold text-gray-800">{placeDetail.averageRating}</span>
                    <span className="text-sm text-gray-500 font-medium">({placeDetail.checkins?.length || 0} đánh giá)</span>
                  </div>

                  {/* CHỮ DÀN ĐỀU 2 BÊN BẰNG TEXT-JUSTIFY */}
                  <p className="text-gray-700 text-[15px] leading-relaxed text-justify">{placeDetail.description}</p>
                  
                  {placeDetail.images && placeDetail.images.length > 0 && (
                    <div className="mb-2">
                      <h4 className="font-bold text-purple-900 text-sm mb-3 flex items-center gap-2"><FaImage />Hình ảnh</h4>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {placeDetail.images.map(img => (
                          <img 
                            key={img.id} 
                            src={`http://localhost:8080/hue-travel-map/images/${img.url}`} 
                            className="w-20 h-20 object-cover rounded-xl shadow-sm shrink-0 border border-gray-100 cursor-pointer hover:opacity-80" 
                            alt="phu" 
                            onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="my-2 border-gray-100" />
                  
                  <h3 className="font-bold text-[#2e0052] text-xl mb-3">Bài đánh giá</h3>
                  <div className="space-y-4">
                    {placeDetail.checkins?.map(checkin => (
                      <div key={checkin.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          {checkin.userAvatar ? (
                            <img 
                              src={`http://localhost:8080/hue-travel-map/images/${checkin.userAvatar}`} 
                              className="w-9 h-9 rounded-full object-cover" 
                              alt="ava" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-100">
                              {getInitial(checkin.userFullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{checkin.userFullName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(checkin.createdDate).toLocaleDateString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                            <div className="flex text-yellow-500 text-[10px] mt-0.5">
                              {[...Array(5)].map((_, i) => <FaStar key={i} className={i < checkin.rating ? "" : "text-gray-200"}/>)}
                            </div>
                          </div>
                        </div>
                        <p className="text-[14px] text-gray-700 leading-relaxed">{checkin.content}</p>
                        
                        {checkin.images && checkin.images.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                            {checkin.images.map(img => (
                              <img 
                                key={img.id} 
                                src={`http://localhost:8080/hue-travel-map/images/${img.url}`} 
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 shrink-0" 
                                alt="checkin-img" 
                                onClick={() => setFullscreenImage(`http://localhost:8080/hue-travel-map/images/${img.url}`)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CHÂN SIDEBAR CHỨA NÚT CHECK-IN */}
              <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex justify-center">
                <button 
                  onClick={handleCheckinClick}
                  disabled={isVerifying}
                  className="w-[85%] py-3 bg-[#2e0052] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#1a0033] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <FaMapMarkerAlt /> {isVerifying ? 'Đang xác minh vị trí...' : 'Check-in ngay!'}
                </button>
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500 font-semibold">Đang tải dữ liệu...</div>
          )}
        </aside>

        {/* MODAL PHÓNG TO ẢNH FULLSCREEN */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
              <IoClose size={28} />
            </button>
            <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen" />
          </div>
        )}

        {/* CÁC NÚT ĐIỀU KHIỂN CHỈ ĐƯỜNG VÀ MODAL CHI TIẾT */}
        {routePath && (
          <div className="absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 z-[1500] pointer-events-auto flex items-center gap-3">
            <button 
              onClick={() => setShowStepsModal(true)}
              className="px-6 py-3 bg-purple-100 text-purple-800 rounded-full font-black hover:bg-purple-200 transition text-sm shadow-xl whitespace-nowrap"
            >
              Chi tiết đường đi
            </button>
            <button 
              onClick={() => { 
                setRoutePath(null); 
                setRouteSteps(null); 
                setShowStepsModal(false); 
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-full font-black hover:bg-red-600 transition text-sm shadow-xl whitespace-nowrap"
            >
              Xóa chỉ đường
            </button>
          </div>
        )}

        {showStepsModal && (
          <RouteStepsModal steps={routeSteps} onClose={() => setShowStepsModal(false)} />
        )}

        {/* BẢN ĐỒ LEAFLET */}
        <MapContainer 
          ref={mapRef}
          center={DAI_NOI_CENTER} 
          zoom={15} zoomControl={false} 
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />

          {/* VẼ ĐƯỜNG ĐI LÊN BẢN ĐỒ NẾU CÓ */}
          {routePath && (
            <Polyline 
              positions={routePath} 
              color="#6b21a8"
              weight={5} 
              opacity={0.7}
              lineJoin="round"
            />
          )}

          {/* COMPONENT LẮNG NGHE SỰ KIỆN CLICK */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* POPUP HIỂN THỊ KHI CLICK VÀO BẢN ĐỒ */}
          {clickedLocation && (
            <Popup 
              position={clickedLocation} 
              onClose={() => setClickedLocation(null)}
              className="custom-popup"
            >
              <div className="text-center p-1">
                <p className="font-bold text-[#2e0052] mb-1 text-sm">Vị trí đã chọn: </p>
                <p className="text-[11px] text-gray-500 mb-3 font-mono">
                  {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
                </p>
                <button 
                  onClick={(e) => {
                    // Chặn click xuyên xuống bản đồ
                    e.stopPropagation(); 
                    e.preventDefault();

                    const token = localStorage.getItem('token');
                    if (!token) {
                      setActiveModal('login');
                    } else {
                      setActiveModal('suggestion');
                    }
                  }}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors w-full shadow-sm"
                >
                  Gửi kiến nghị địa điểm
                </button>
              </div>
            </Popup>
          )}

          {renderedMarkers}
        </MapContainer>
        <AIChatbox/>
      </div>
    </div>
  );
}

export default MapPage;