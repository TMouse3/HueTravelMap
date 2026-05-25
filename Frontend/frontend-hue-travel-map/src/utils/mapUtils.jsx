import { 
  FaLandmark, FaTree, FaCoffee, FaUtensils, FaUmbrellaBeach, 
  FaVihara, FaChurch, FaSchool, FaShoppingBag, FaHotel, FaMapMarkerAlt 
} from 'react-icons/fa';

// Lấy icon tương ứng với categoryId
export const getCategoryIcon = (categoryId, customClass = "text-white text-[12px]") => {
  switch (categoryId) {
    case 1: return <FaLandmark className={customClass} />; 
    case 2: return <FaTree className={customClass} />; 
    case 3: return <FaCoffee className={customClass} />; 
    case 4: return <FaUtensils className={customClass} />; 
    case 5: return <FaUmbrellaBeach className={customClass} />; 
    case 6: return <FaVihara className={customClass} />; 
    case 7: return <FaChurch className={customClass} />; 
    case 8: return <FaSchool className={customClass} />; 
    case 9: return <FaShoppingBag className={customClass} />; 
    case 10: return <FaHotel className={customClass} />; 
    default: return <FaMapMarkerAlt className={customClass} />;
  }
};

// Dịch các loại maneuver của Mapbox thành hướng dẫn bằng tiếng Việt
export const translateManeuver = (step) => {
  const { type, modifier } = step.maneuver;
  const name = step.name ? `vào ${step.name}` : '';
  const dist = step.distance > 0 ? ` (${Math.round(step.distance)}m)` : '';

  if (type === 'depart') return `📍 Bắt đầu xuất phát ${name}`;
  if (type === 'arrive') return `🚩 Đã đến nơi`;
  if (type === 'roundabout') return `🔄 Đi vào vòng xuyến ${name} ${dist}`;
  
  if (type === 'turn') {
    if (modifier === 'left') return `⬅️ Rẽ trái ${name} ${dist}`;
    if (modifier === 'right') return `➡️ Rẽ phải ${name} ${dist}`;
    if (modifier === 'slight left') return `↖️ Chếch sang trái ${name} ${dist}`;
    if (modifier === 'slight right') return `↗️ Chếch sang phải ${name} ${dist}`;
    if (modifier === 'uturn') return `↩️ Quay đầu ${name} ${dist}`;
  }
  
  return `⬆️ Đi tiếp ${dist} ${name}`; 
};