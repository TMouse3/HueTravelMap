package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyLocationRequest {
    
    @NotNull(message = "Thiếu ID địa điểm")
    private Integer placeId;
    
    @NotNull(message = "Thiếu tọa độ Vĩ độ (Lat)")
    private Double userLat;
    
    @NotNull(message = "Thiếu tọa độ Kinh độ (Lng)")
    private Double userLng;
}