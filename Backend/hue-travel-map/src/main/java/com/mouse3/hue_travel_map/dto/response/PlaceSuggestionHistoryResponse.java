package com.mouse3.hue_travel_map.dto.response;

import lombok.*;

import org.springframework.data.domain.Page;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlaceSuggestionHistoryResponse {
    private long totalApproved; // Số địa điểm đóng góp thành công
    private Page<PlaceSuggestionResponse> suggestionsPage; // Danh sách các kiến nghị (phân trang)
}