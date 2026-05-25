package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.request.PlaceRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceResponse;
import com.mouse3.hue_travel_map.entity.Category;
import com.mouse3.hue_travel_map.entity.Checkin;
import com.mouse3.hue_travel_map.entity.Place;
import com.mouse3.hue_travel_map.entity.PlaceImage;
import com.mouse3.hue_travel_map.mapper.PlaceMapper;
import com.mouse3.hue_travel_map.repository.CategoryRepository;
import com.mouse3.hue_travel_map.repository.CheckinRepository;
import com.mouse3.hue_travel_map.repository.PlaceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlaceService {

    PlaceRepository placeRepository;
    CategoryRepository categoryRepository;
    PlaceMapper placeMapper;
    CheckinRepository checkinRepository;

    // Lấy danh sách địa điểm được check-in nhiều nhất trong khoảng thời gian nhất định
    public List<PlaceResponse> getTopPlaces(String time) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        
        if ("week".equals(time)) {
            start = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).with(java.time.LocalTime.MIN);
        } else if ("month".equals(time)) {
            start = now.withDayOfMonth(1).with(java.time.LocalTime.MIN);
        } else {
            start = LocalDateTime.of(1970, 1, 1, 0, 0); // Mọi thời đại
        }

        List<Object[]> results = checkinRepository.getTopPlacesBetween(start, now, PageRequest.of(0, 5));
        
        return results.stream()
                .filter(row -> ((Place) row[0]).getIsActive()) // Chỉ lấy các địa điểm đang mở
                .map(row -> {
                    Place place = (Place) row[0];
                    long checkinCount = ((Number) row[1]).longValue();
                    
                    PlaceResponse response = placeMapper.toPlaceResponseForList(place);
                    response.setTotalCheckins(checkinCount); // Cập nhật số lượt theo mốc thời gian
                    response.setAverageRating(calculateAverageRating(place.getCheckins()));
                    return response;
                }).toList();
    }

    // [ADMIN] Tạo địa điểm mới
    public PlaceResponse createPlace(PlaceRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục được chọn!"));

        Place place = placeMapper.toPlace(request);
        place.setCategory(category);
        place.setIsActive(true);

        // Xử lý lưu danh sách ảnh phụ
        if (request.getImageNames() != null && !request.getImageNames().isEmpty()) {
            List<PlaceImage> placeImages = request.getImageNames().stream()
                    .map(imageName -> PlaceImage.builder()
                            .url(imageName)
                            .place(place) // Gắn địa điểm cha cho ảnh con
                            .build())
                    .toList();
            place.setImages(placeImages);
        }

        return placeMapper.toPlaceResponse(placeRepository.save(place));
    }

    // [ADMIN] Cập nhật địa điểm
    public PlaceResponse updatePlace(Integer id, PlaceRequest request) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm!"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        placeMapper.updatePlace(place, request);
        place.setCategory(category);

        // Xử lý cập nhật danh sách ảnh phụ
        // Nhờ có orphanRemoval = true, khi ta clear() mảng cũ và add() mảng mới, Hibernate sẽ tự động xóa/thêm dưới DB
        if (place.getImages() != null) {
            place.getImages().clear();
        }
        
        if (request.getImageNames() != null && !request.getImageNames().isEmpty()) {
            List<PlaceImage> newImages = request.getImageNames().stream()
                    .map(imageName -> PlaceImage.builder()
                            .url(imageName)
                            .place(place)
                            .build())
                    .toList();
            place.getImages().addAll(newImages);
        }

        return placeMapper.toPlaceResponse(placeRepository.save(place));
    }

    // [USER] Lấy danh sách địa điểm (Có hỗ trợ lọc theo Category)
    public List<PlaceResponse> getAllPlaces(Integer categoryId) {
        List<Object[]> results = placeRepository.findAllPlacesForMap(categoryId);
        
        return results.stream()
                .map(row -> {
                    Place place = (Place) row[0];        
                    Double avgRating = (Double) row[1];  
                    Long totalCheckins = (Long) row[2];  // 👉 Lấy tổng check-in

                    PlaceResponse response = placeMapper.toPlaceResponseForList(place);
                    response.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
                    response.setTotalCheckins(totalCheckins); // 👉 Gắn vào Response
                    
                    return response;
                })
                .toList();
    }

    // [ADMIN] Lấy danh sách địa điểm có phân trang và filter theo tên, category
    public Page<PlaceResponse> getAllPlacesAdmin(String name, Integer categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        // Repository giờ đã trả về Place kèm Category đầy 
        String nameFilter = (name != null && !name.isEmpty()) ? "%" + name + "%" : null;
        Page<Place> placePage = placeRepository.findAllAdmin(nameFilter, categoryId, pageable);
        
        // Mapper tự động chuyển đổi, không còn vòng lặp truy vấn nữa!
        return placePage.map(placeMapper::toPlaceResponse);
    }

    // [USER] Lấy chi tiết địa điểm (Dùng mapper "nặng" lấy toàn bộ dữ liệu)
    @Transactional(readOnly = true)
    public PlaceResponse getPlaceById(Integer id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm!"));
        
        if (!place.getIsActive()) {
            throw new RuntimeException("Địa điểm này hiện đang tạm ẩn hoặc không tồn tại!");
        }

        PlaceResponse response = placeMapper.toPlaceResponse(place);
        response.setAverageRating(calculateAverageRating(place.getCheckins()));
        response.setTotalCheckins((long) place.getCheckins().size());
        
        return response;
    }

    // [ADMIN] Thay đổi trạng thái ẩn/hiện của địa điểm (toggle)
    public PlaceResponse togglePlaceStatus(Integer id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm!"));
        
        place.setIsActive(!place.getIsActive());
        return placeMapper.toPlaceResponse(placeRepository.save(place));
    }

    // [ADMIN] Xóa địa điểm (Xóa hẳn khỏi DB)
    public void deletePlace(Integer id) {
        if (!placeRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy địa điểm!");
        }
        placeRepository.deleteById(id);
    }

    // Tính đánh giá trung bình của địa điểm dựa trên danh sách check-in
    private Double calculateAverageRating(List<Checkin> checkins) {
        if (checkins == null || checkins.isEmpty()) {
            return 0.0; // Chưa có ai đánh giá thì trả về 0 sao
        }
        double avg = checkins.stream()
                .mapToInt(Checkin::getRating)
                .average()
                .orElse(0.0);
        return Math.round(avg * 10.0) / 10.0; 
    }
}