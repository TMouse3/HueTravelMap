package com.mouse3.hue_travel_map.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinResponse {
    private Integer id;
    private Byte rating;
    private String content;
    private String userFullName;
    private String userAvatar;
    private LocalDateTime createdDate;
    
    private Integer placeId;
    private String placeName;
    private Integer categoryId;
    
    private List<CheckinImageResponse> images;
}