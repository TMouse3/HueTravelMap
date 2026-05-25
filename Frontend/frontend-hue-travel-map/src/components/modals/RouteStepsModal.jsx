import React from 'react';
import { IoClose } from 'react-icons/io5';
import { translateManeuver } from '../../utils/mapUtils'; // Đảm bảo bạn đã có hàm này ở lần trước

function RouteStepsModal({ onClose, steps }) {
  if (!steps || steps.length === 0) return null;

  // Tính tổng quãng đường
  const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0);
  const formattedDistance = totalDistance > 1000 
    ? (totalDistance / 1000).toFixed(1) + ' km' 
    : Math.round(totalDistance) + ' m';

  return (
    <div className="fixed top-24 bottom-6 right-4 md:right-16 z-[1800] pointer-events-none flex justify-end w-full max-w-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full h-full shadow-[0_12px_40px_rgba(75,0,130,0.15)] flex flex-col pointer-events-auto border border-gray-100 animate-fade-in">
        
        {/* Header*/}
        <div className="p-5 border-b border-gray-100 shrink-0 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition"
          >
            <IoClose size={22} />
          </button>
          <h2 className="text-xl font-black text-[#2e0052] mb-1 pr-6">Chi tiết đường đi</h2>
          <p className="text-gray-500 text-sm font-medium">
            Quãng đường: <span className="font-bold text-purple-700">{formattedDistance}</span>
          </p>
        </div>

        {/* Nội dung danh sách*/}
        <div className="overflow-y-auto no-scrollbar flex-grow p-4 space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <div className="w-6 h-6 shrink-0 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-[11px] font-black mt-0.5 shadow-sm">
                {index + 1}
              </div>
              <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                {translateManeuver(step)}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default RouteStepsModal;