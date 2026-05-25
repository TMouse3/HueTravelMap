package com.mouse3.hue_travel_map.dto.response;

import org.springframework.data.domain.Page;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinHistoryResponse {
    private long totalCheckins;      // Tổng số lần đánh giá
    private long totalVisitedPlaces; // Tổng số địa điểm đã đến
    private Page<CheckinResponse> checkinsPage; // Danh sách check-in (phân trang)
}