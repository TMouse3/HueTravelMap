package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateRequest {
    
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    // Không bắt buộc, truyền "" hoặc null đều được để xóa Avatar
    private String avatarUrl; 
}