package com.mouse3.hue_travel_map.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceResponse {
    private Integer id;
    private String name;
    private String description;
    private BigDecimal lat;
    private BigDecimal lng;
    private String thumbnailUrl;
    private Boolean isActive;
    private LocalDateTime createdDate;
    
    private Double averageRating;

    private CategoryResponse category;
    private Long totalCheckins;
    
    private List<PlaceImageResponse> images;
    private List<CheckinResponse> checkins;
}