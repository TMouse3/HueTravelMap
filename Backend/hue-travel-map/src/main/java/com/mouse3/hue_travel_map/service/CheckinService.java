package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.request.CheckinRequest;
import com.mouse3.hue_travel_map.dto.response.CheckinHistoryResponse;
import com.mouse3.hue_travel_map.dto.response.CheckinResponse;
import com.mouse3.hue_travel_map.entity.Checkin;
import com.mouse3.hue_travel_map.entity.CheckinImage;
import com.mouse3.hue_travel_map.entity.Place;
import com.mouse3.hue_travel_map.entity.User;
import com.mouse3.hue_travel_map.entity.enums.Role;
import com.mouse3.hue_travel_map.mapper.CheckinMapper;
import com.mouse3.hue_travel_map.repository.CheckinRepository;
import com.mouse3.hue_travel_map.repository.PlaceRepository;
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

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckinService {

    CheckinRepository checkinRepository;
    UserRepository userRepository;
    PlaceRepository placeRepository;
    CheckinMapper checkinMapper;

    // Hàm tính khoảng cách giữa 2 điểm (lat1, lon1) và (lat2, lon2) bằng công thức Haversine
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; 
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; 
    }

    // Hàm kiểm tra xem vị trí check-in có hợp lệ hay không (trong bán kính 100m)
    public boolean verifyCheckinLocation(Integer placeId, Double userLat, Double userLng) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Địa điểm không tồn tại!"));

        double distance = calculateDistance(userLat, userLng, place.getLat().doubleValue(), place.getLng().doubleValue());
        return distance <= 100.0;
    }

    // [USER] Lấy lịch sử check-in của mình, có filter theo tên địa điểm và rating, có phân trang
    public CheckinHistoryResponse getMyHistory(String placeName, Byte rating, int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        long totalCheckins = checkinRepository.countByUser(user);
        long totalVisitedPlaces = checkinRepository.countDistinctPlacesByUser(user);

        String searchName = (placeName != null && !placeName.trim().isEmpty()) ? "%" + placeName.trim() + "%" : null;
        Pageable pageable = PageRequest.of(page, size);
        Page<CheckinResponse> pPage = checkinRepository.findByUserCriteria(user, searchName, rating, pageable)
                .map(checkinMapper::toCheckinResponse);

        return CheckinHistoryResponse.builder()
                .totalCheckins(totalCheckins)
                .totalVisitedPlaces(totalVisitedPlaces)
                .checkinsPage(pPage)
                .build();
        }

    // [ADMIN] Lấy tất cả check-in, có filter theo tên địa điểm và rating, có phân trang
    public Page<CheckinResponse> getAllCheckinsAdmin(Integer placeId, Byte rating, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        return checkinRepository.findAllAdmin(placeId, rating, pageable)
                .map(checkinMapper::toCheckinResponse);
    }

    // [USER] Gửi Check-in
    public CheckinResponse createCheckin(CheckinRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new RuntimeException("Địa điểm không tồn tại!"));

        if (!verifyCheckinLocation(request.getPlaceId(), request.getUserLat(), request.getUserLng())) {
             throw new RuntimeException("Vị trí không hợp lệ, bạn phải ở trong bán kính 100m!");
        }

        var lastCheckinOpt = checkinRepository.findTopByUserAndPlaceOrderByCreatedDateDesc(user, place);
        if (lastCheckinOpt.isPresent()) {
            LocalDateTime lastTime = lastCheckinOpt.get().getCreatedDate();
            long hoursPassed = ChronoUnit.HOURS.between(lastTime, LocalDateTime.now());
            if (hoursPassed < 6) {
                throw new RuntimeException("Bạn đã check-in ở đây gần đây rồi. Vui lòng quay lại sau " + (6 - hoursPassed) + " tiếng nữa!");
            }
        }

        Checkin checkin = Checkin.builder()
                .rating(request.getRating())
                .content(request.getContent())
                .user(user)
                .place(place)
                .build();

        if (request.getImageNames() != null && !request.getImageNames().isEmpty()) {
            List<CheckinImage> checkinImages = request.getImageNames().stream()
                    .map(imageName -> CheckinImage.builder()
                            .url(imageName)
                            .checkin(checkin)
                            .build())
                    .toList();
            checkin.setImages(checkinImages);
        }

        return checkinMapper.toCheckinResponse(checkinRepository.save(checkin));
    }

    // [ADMIN] Xóa Check-in (Admin có thể xóa bất kỳ check-in nào, User chỉ được xóa check-in của mình)
    public void deleteCheckin(Integer id) {
        Checkin checkin = checkinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi check-in!"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Cho phép xóa nếu người gọi là ADMIN, HOẶC là chủ sở hữu của Check-in đó
        if (currentUser.getRole() == Role.ADMIN || checkin.getUser().getId().equals(currentUser.getId())) {
            checkinRepository.deleteById(id);
        } else {
            throw new RuntimeException("Từ chối truy cập: Bạn chỉ có thể xóa đánh giá của chính mình!");
        }
    }
}