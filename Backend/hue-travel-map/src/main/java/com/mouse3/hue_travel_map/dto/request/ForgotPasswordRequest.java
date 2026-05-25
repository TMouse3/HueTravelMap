package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    private String email;
}