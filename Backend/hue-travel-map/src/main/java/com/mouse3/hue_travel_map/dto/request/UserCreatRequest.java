package com.mouse3.hue_travel_map.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreatRequest {
    @NotBlank(message = "Email không được để trống")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", 
        message = "Chỉ chấp nhận tài khoản có đuôi @gmail.com"
    )
    private String email;
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Pattern(
        regexp = "^[\\\\x21-\\\\x7E]+$", 
        message = "Mật khẩu không được chứa khoảng trắng và dấu tiếng Việt"
    )
    private String password;
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
}
