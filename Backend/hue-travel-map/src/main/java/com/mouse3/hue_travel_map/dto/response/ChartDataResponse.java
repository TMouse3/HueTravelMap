package com.mouse3.hue_travel_map.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChartDataResponse {
    private String month; // Tên hiển thị ở cột X (vd: "Tháng 1")
    private long value;   // Giá trị ở cột Y
}