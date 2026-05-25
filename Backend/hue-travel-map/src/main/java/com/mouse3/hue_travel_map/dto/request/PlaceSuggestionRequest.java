package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSuggestionRequest {

    @NotBlank(message = "Tên địa điểm kiến nghị không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Vĩ độ không được để trống")
    private BigDecimal lat;

    @NotNull(message = "Kinh độ không được để trống")
    private BigDecimal lng;

    @NotBlank(message = "Ảnh chính của địa điểm không được để trống")
    private String thumbnailUrl;

    @NotNull(message = "Vui lòng chọn danh mục cho địa điểm")
    private Integer categoryId;

    @Size(max = 3, message = "Chỉ được đính kèm tối đa 3 ảnh phụ")
    private List<String> imageNames;
}