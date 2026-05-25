package com.mouse3.hue_travel_map.dto.response;

import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSuggestionResponse {
    private Integer id;
    private String name;
    private String description;
    private BigDecimal lat;
    private BigDecimal lng;
    private String thumbnailUrl;
    private SuggestionStatus status;
    private LocalDateTime createdDate;
    private String userFullName;
    private String userAvatar;
    private CategoryResponse category;
    private List<PlaceImageResponse> images;
}