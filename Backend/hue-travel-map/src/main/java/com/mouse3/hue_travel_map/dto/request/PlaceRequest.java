package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceRequest {

    @NotBlank(message = "Tên địa điểm không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Vĩ độ (lat) không được để trống")
    private BigDecimal lat;

    @NotNull(message = "Kinh độ (lng) không được để trống")
    private BigDecimal lng;

    // Bắt buộc Admin phải truyền link ảnh chính vào đây khi tạo/sửa
    @NotBlank(message = "Ảnh đại diện không được để trống")
    private String thumbnailUrl;

    @NotNull(message = "Phải chọn danh mục cho địa điểm")
    private Integer categoryId;

    // Danh sách ảnh phụ
    @Size(max = 3, message = "Chỉ được đính kèm tối đa 3 ảnh phụ")
    private List<String> imageNames;
}