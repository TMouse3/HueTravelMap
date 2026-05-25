import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoSend, IoImageOutline } from 'react-icons/io5';
import { FaRobot, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../services/aiService';

function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "**Chào bạn, tôi là HueTravelMap.AI - Trợ lý AI thông minh tìm kiếm địa điểm theo hình ảnh.**\n\nHãy gửi cho tôi từ 1 đến 3 bức ảnh, tôi sẽ cho bạn biết đó là nơi nào nhé!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      return alert('Chỉ được chọn tối đa 3 ảnh!');
    }
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // 1. Lưu tin nhắn của người dùng lên màn hình
    const userMsg = {
      sender: 'user',
      text: inputMessage,
      images: selectedFiles.map(file => URL.createObjectURL(file)) // Hiển thị tạm ảnh
    };
    setMessages(prev => [...prev, userMsg]);
    
    const filesToSend = [...selectedFiles];
    const textToSend = inputMessage;

    // 2. Reset ô nhập liệu
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    // 3. Gửi lên Backend
    try {
      const res = await aiService.chatWithImage(filesToSend, textToSend);
      setMessages(prev => [...prev, { sender: 'ai', text: res.data }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Vui lòng thử lại sau nhé!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/*NÚT TRÒN MỞ/ĐÓNG CHATBOX*/}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[100px] md:bottom-[100px] right-2 md:right-1 z-[1900] w-14 h-14 bg-gradient-to-tr from-[#430a75] to-purple-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(75,0,130,0.4)] hover:scale-110 transition-transform"
      >
        {isOpen ? <IoClose size={28} /> : <FaRobot size={24} className="animate-pulse" />}
      </button>

      {/*KHUNG CHATBOX*/}
      {isOpen && (
        <div 
          className="fixed bottom-6 md:bottom-6 right-[70px] md:right-[70px] z-[1900] w-[calc(100%-90px)] md:w-[380px] h-[530px] max-h-[calc(100vh-180px)] bg-white rounded-2xl shadow-[0_12px_40px_rgba(75,0,130,0.2)] border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up"
          // CHẶN MỌI THAO TÁC RƠI XUỐNG BẢN ĐỒ
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#430a75] to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaRobot size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm">HueTravelMap.AI</h3>
                <p className="text-[10px] text-purple-200">Trợ lý tìm kiếm qua ảnh</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition">
              <IoClose size={24} />
            </button>
          </div>

          {/* Vùng Tin Nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Khu vực hiển thị ảnh người dùng gửi */}
                {msg.images && msg.images.length > 0 && (
                  <div className="flex gap-1 mb-1 justify-end flex-wrap max-w-[80%]">
                    {msg.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="upload" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all" 
                        onClick={() => setFullscreenImage(img)}
                      />
                    ))}
                  </div>
                )}

                {/* Khu vực Text */}
                {msg.text && (
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-purple-100 text-purple-900 rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                    {msg.sender === 'ai' ? (
                      <div className="markdown-content text-justify">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Hiệu ứng AI đang gõ */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-9">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung ảnh chờ gửi (Preview) */}
          {selectedFiles.length > 0 && (
            <div className="px-3 pt-2 flex gap-2 bg-white border-t border-gray-50 overflow-x-auto">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative w-12 h-12 shrink-0">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Khu vực Nhập liệu */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-end gap-2">
            <label className="w-10 h-10 shrink-0 bg-gray-100 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-xl flex items-center justify-center cursor-pointer transition">
              <IoImageOutline size={20} />
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
            </label>

            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Bạn muốn hỏi gì?"
              disabled={isLoading}
              rows="1"
              className="flex-1 max-h-24 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none no-scrollbar"
            />

            <button 
              type="submit" 
              disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
              className="w-10 h-10 shrink-0 bg-[#430a75] text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 hover:bg-purple-900 transition"
            >
              <IoSend size={16} className="-ml-0.5" />
            </button>
          </form>

        </div>
      )}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
            <IoClose size={28} />
          </button>
          <img src={fullscreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen" />
        </div>
      )}
    </>
  );
}

export default AIChatbox;