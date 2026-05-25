package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.request.PlaceSuggestionRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceSuggestionHistoryResponse;
import com.mouse3.hue_travel_map.dto.response.PlaceSuggestionResponse;
import com.mouse3.hue_travel_map.entity.*;
import com.mouse3.hue_travel_map.entity.enums.Role;
import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;
import com.mouse3.hue_travel_map.mapper.PlaceSuggestionMapper;
import com.mouse3.hue_travel_map.repository.CategoryRepository;
import com.mouse3.hue_travel_map.repository.PlaceRepository;
import com.mouse3.hue_travel_map.repository.PlaceSuggestionRepository;
import com.mouse3.hue_travel_map.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlaceSuggestionService {

    PlaceSuggestionRepository suggestionRepository;
    UserRepository userRepository;
    CategoryRepository categoryRepository;
    PlaceRepository placeRepository;
    PlaceSuggestionMapper suggestionMapper;

    // [USER] Gửi kiến nghị thêm địa điểm mới (Có giới hạn số lượng gửi trong ngày)
    @Transactional
    public PlaceSuggestionResponse createSuggestion(PlaceSuggestionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long countToday = suggestionRepository.countByUserAndCreatedDateAfter(user, startOfDay);
        if (countToday >= 3) {
            throw new RuntimeException("Bạn đã gửi 3 kiến nghị trong hôm nay. Vui lòng quay lại vào ngày mai!");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không hợp lệ"));

        PlaceSuggestion suggestion = suggestionMapper.toEntity(request);
        suggestion.setUser(user);
        suggestion.setCategory(category); // Đã có thể set Category
        suggestion.setStatus(SuggestionStatus.PENDING); 

        if (request.getImageNames() != null && !request.getImageNames().isEmpty()) {
            List<PlaceImage> images = request.getImageNames().stream()
                    .map(name -> PlaceImage.builder()
                            .url(name)
                            .suggestion(suggestion) 
                            .build())
                    .toList();
            suggestion.setImages(images);
        }

        return suggestionMapper.toResponse(suggestionRepository.save(suggestion));
    }

    // [USER] Xem lịch sử kiến nghị của mình, có filter theo tên địa điểm và trạng thái, có phân trang
    public PlaceSuggestionHistoryResponse getMySuggestions(String name, SuggestionStatus status, int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        long totalApproved = suggestionRepository.countByUserAndStatus(user, SuggestionStatus.APPROVED);

        String searchName = (name != null && !name.trim().isEmpty()) ? "%" + name.trim() + "%" : null;
        Pageable pageable = PageRequest.of(page, size);
        
        Page<PlaceSuggestion> pPage = suggestionRepository.findByUserCriteria(user, searchName, status, pageable);

        return PlaceSuggestionHistoryResponse.builder()
                .totalApproved(totalApproved)
                .suggestionsPage(pPage.map(suggestionMapper::toResponse))
                .build();
    }
    
    // [ADMIN] Lấy tất cả kiến nghị, có filter theo tên địa điểm và trạng thái, có phân trang
    public Page<PlaceSuggestionResponse> getAllSuggestionsForAdmin(String name, SuggestionStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        String searchName = (name != null && !name.trim().isEmpty()) ? "%" + name.trim() + "%" : null;
        return suggestionRepository.findAllAdmin(searchName, status, pageable)
                .map(suggestionMapper::toResponse);
    }

    // [ADMIN] Duyệt kiến nghị: Tạo địa điểm mới từ dữ liệu kiến nghị, sau đó đổi trạng thái kiến nghị thành APPROVED
    @Transactional
    public String approveSuggestion(Integer id) {
        PlaceSuggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kiến nghị!"));

        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể duyệt kiến nghị đang ở trạng thái chờ!");
        }

        // 1. Tạo Địa điểm (Place) mới từ dữ liệu kiến nghị
        Place newPlace = Place.builder()
                .name(suggestion.getName())
                .description(suggestion.getDescription())
                .lat(suggestion.getLat())
                .lng(suggestion.getLng())
                .thumbnailUrl(suggestion.getThumbnailUrl())
                .category(suggestion.getCategory())
                .isActive(true)
                .build();

        Place savedPlace = placeRepository.save(newPlace);

        // 2. Tái sử dụng bảng PlaceImage: Gắn ID địa điểm mới cho các ảnh phụ hiện tại
        if (suggestion.getImages() != null && !suggestion.getImages().isEmpty()) {
            for (PlaceImage image : suggestion.getImages()) {
                image.setPlace(savedPlace); 
            }
            // Nhờ @Transactional, Hibernate sẽ tự phát hiện image bị thay đổi và sinh ra lệnh UPDATE place_id
        }

        // 3. Đổi trạng thái kiến nghị thành APPROVED
        suggestion.setStatus(SuggestionStatus.APPROVED);
        suggestionRepository.save(suggestion);

        return "Phê duyệt thành công! Đã tạo địa điểm: " + savedPlace.getName();
    }

    // [ADMIN] Từ chối kiến nghị: Đổi trạng thái kiến nghị thành REJECTED, KHÔNG tạo địa điểm mới
    @Transactional
    public String rejectSuggestion(Integer id) {
        PlaceSuggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kiến nghị!"));

        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new RuntimeException("Kiến nghị này đã được xử lý trước đó!");
        }

        suggestion.setStatus(SuggestionStatus.REJECTED);
        suggestionRepository.save(suggestion);

        return "Đã từ chối kiến nghị!";
    }

    // [ADMIN] Xóa kiến nghị (Chỉ xóa được khi kiến nghị chưa được duyệt, hoặc người xóa là chủ sở hữu của kiến nghị đó)
    @Transactional
    public void deleteSuggestion(Integer id) {
        PlaceSuggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kiến nghị!"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (suggestion.getStatus() == SuggestionStatus.APPROVED) {
            throw new RuntimeException("Không thể xóa kiến nghị đã được phê duyệt!");
        }

        // Cho phép xóa nếu người gọi là ADMIN, HOẶC là chủ sở hữu của kiến nghị đó
        if (currentUser.getRole() == Role.ADMIN || suggestion.getUser().getId().equals(currentUser.getId())) {
            suggestionRepository.deleteById(id);
        } else {
            throw new RuntimeException("Từ chối truy cập: Bạn chỉ có thể xóa kiến nghị của chính mình!");
        }
    }
}