package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinRequest {

    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private Byte rating;

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    private String content;

    @NotNull(message = "Thiếu ID địa điểm")
    private Integer placeId;

    @NotNull(message = "Không lấy được vị trí Vĩ độ (Lat) của bạn")
    private Double userLat;

    @NotNull(message = "Không lấy được vị trí Kinh độ (Lng) của bạn")
    private Double userLng;

    @Size(max = 3, message = "Chỉ được đính kèm tối đa 3 ảnh cho mỗi lượt đánh giá")
    private List<String> imageNames; 
}