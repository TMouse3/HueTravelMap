package com.mouse3.hue_travel_map.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.content.Media;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import com.mouse3.hue_travel_map.repository.PlaceRepository;

@Service
public class ChatAIService {
    private final ChatClient chatClient;
    private final PlaceRepository placeRepository;

    public ChatAIService(ChatClient.Builder builder, PlaceRepository placeRepository){
        this.chatClient = builder.build();
        this.placeRepository = placeRepository;
    }

    public String chatWithImage(List<MultipartFile> files, String message) {
        
        // Ràng buộc 1: Phải gửi ít nhất 1 ảnh
        if (files == null || files.isEmpty() || files.get(0).isEmpty()) {
            return "**Chào bạn, tôi là HueTravelMap.AI - Trợ lý AI thông minh tìm kiếm địa điểm theo hình ảnh.**\n\nTôi chưa nhận được hình ảnh nào từ bạn. Vui lòng tải lên từ 1 đến 3 bức ảnh địa danh để tôi có thể xem xét nhé!";
        }

        // Ràng buộc 2: Chỉ cho phép tối đa 3 ảnh
        if (files.size() > 3) {
            return "**Chào bạn, tôi là HueTravelMap.AI - Trợ lý AI thông minh tìm kiếm địa điểm theo hình ảnh.**\n\nXin lỗi, để đảm bảo độ chính xác, hiện tại tôi chỉ có thể phân tích tối đa 3 bức ảnh trong một lần hỏi. Bạn vui lòng chọn lọc lại ảnh nhé!";
        }

        // 2. Lấy ngữ cảnh địa điểm từ DB để bơm vào System Prompt
        List<Object[]> results = placeRepository.getPlacesContextForAI();

        String placesContext = results.stream()
                .map(row -> {
                    String name = (String) row[0];
                    String catName = (String) row[1];
                    Double avgRating = (Double) row[2];
                    Long checkinCount = (Long) row[3];
                    double roundedRating = Math.round(avgRating * 10.0) / 10.0;
                    
                    return String.format("- Tên: %s (Loại: %s) | Đánh giá: %s sao | Tổng check-in: %d", 
                                        name, catName, roundedRating, checkinCount);
                })
                .collect(Collectors.joining("\n"));

        // 3. Xây dựng System Prompt với LUẬT THÉP MỚI
        String systemPrompt = """
                Quy tắc BẮT BUỘC:
                1. MỞ ĐẦU: Bất kể người dùng hỏi gì, BẮT BUỘC phải mở đầu câu trả lời bằng đúng nguyên văn câu này (in đậm): "**Chào bạn, tôi là HueTravelMap.AI - Trợ lý AI thông minh tìm kiếm địa điểm theo hình ảnh.**"
                2. CHỐNG SPAM: Từ chối mọi yêu cầu viết code, làm toán, phân tích ảnh người/động vật... Hãy trả lời: "Tôi chỉ có thể hỗ trợ nhận diện và tìm kiếm các địa điểm du lịch, kiến trúc."
                3. XỬ LÝ HÌNH ẢNH VÀ ĐỐI CHIẾU:
                    - BƯỚC QUAN TRỌNG: Người dùng có thể gửi từ 1 đến 3 ảnh cùng lúc. Bạn phải xác định xem các ảnh này là CÙNG MỘT ĐỊA ĐIỂM hay CÁC ĐỊA ĐIỂM KHÁC NHAU.
                    - Nếu các ảnh chụp CÙNG MỘT ĐỊA ĐIỂM: Bạn có thể gộp chung câu trả lời (Ví dụ: "Cả 3 bức ảnh bạn gửi đều là...").
                    - Nếu các ảnh chụp ĐỊA ĐIỂM KHÁC NHAU: Bạn BẮT BUỘC phải đánh số tách biệt để trả lời cho từng ảnh (Ví dụ: "1. Ảnh đầu tiên là... 2. Ảnh thứ hai là...").
                    - Xác định tên địa danh trong ảnh, nó nằm ở tỉnh/thành phố/quốc gia nào.
                    - NẾU HÌNH ẢNH KHÔNG PHẢI LÀ DẠNG ĐỊA ĐIỂM/ĐỊA DANH, KHÔNG CHỨA THÔNG TIN ĐỊA ĐIỂM/ĐỊA DANH: Thông báo "Hình ảnh không chứa thông tin địa điểm!"
                    - VỚI MỖI ĐỊA ĐIỂM ĐƯỢC NHẬN DIỆN (NẾU CÓ):
                        - NẾU KHỚP VỚI DANH SÁCH NỘI BỘ DƯỚI ĐÂY: 
                            + Thông báo "Địa điểm này ĐÃ CÓ trên bản đồ". 
                            + Cung cấp thông tin "Tên địa điểm", "thuộc loại địa điểm nào", "Số sao đánh giá" và "Tổng lượt check-in" lấy từ danh sách nội bộ. 
                            + Sau đó, XUỐNG DÒNG và viết đúng định dạng: "Giới thiệu ngắn gọn: " kèm theo một đoạn mô tả ngắn gọn (khoảng 2-4 câu) hấp dẫn bằng kiến thức của bạn để mời gọi khách du lịch đến đây.
                        - NẾU KHÔNG CÓ TRONG DANH SÁCH DƯỚI ĐÂY:
                            + Nếu địa điểm thuộc tỉnh Thừa Thiên Huế: Thông báo "Địa điểm này hiện CHƯA CÓ trên hệ thống. Bạn có thể sử dụng chức năng Gửi kiến nghị trên bản đồ để đóng góp thêm nhé!".
                            + Nếu địa điểm KHÔNG thuộc tỉnh Thừa Thiên Huế (ví dụ: Đà Nẵng, Paris...): Thông báo "Địa điểm này nằm ngoài khu vực Huế. Hue Travel Map hiện tại chỉ hỗ trợ bản đồ các địa điểm thuộc tỉnh Thừa Thiên Huế."
                4. VĂN PHONG: Trả lời tự nhiên, thân thiện, sử dụng định dạng danh sách (bullet point) cho các thông tin thống kê để dễ nhìn.

                Danh sách địa điểm ĐANG CÓ trên hệ thống:
                %s
                """.formatted(placesContext);

        // 4. Xử lý câu hỏi mặc định
        String userPrompt = (message == null || message.trim().isEmpty()) 
                ? "Hãy cho tôi biết địa điểm trong (các) bức ảnh là ở đâu và kiểm tra xem nó có trên bản đồ HueTravelMap chưa?" 
                : message;

        // 5. Bơm ảnh vào
        Media[] mediaArray = files.stream()
                .filter(file -> !file.isEmpty())
                .map(file -> Media.builder()
                        .mimeType(MimeTypeUtils.parseMimeType(file.getContentType()))
                        .data(file.getResource())
                        .build())
                .toArray(Media[]::new);

        // 6. Gửi lên Gemini
        return chatClient.prompt()
            .system(systemPrompt)
            .user(promptUserSpec -> promptUserSpec
                .media(mediaArray)
                .text(userPrompt))
            .call()
            .content();
    }
}