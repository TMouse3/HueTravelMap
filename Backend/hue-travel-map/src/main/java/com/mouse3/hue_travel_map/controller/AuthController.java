package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.request.AuthRequest;
import com.mouse3.hue_travel_map.dto.request.ForgotPasswordRequest;
import com.mouse3.hue_travel_map.dto.request.IntrospectRequest;
import com.mouse3.hue_travel_map.dto.request.ResetPasswordRequest;
import com.mouse3.hue_travel_map.dto.response.AuthResponse;
import com.mouse3.hue_travel_map.dto.response.IntrospectResponse;
import com.mouse3.hue_travel_map.service.AuthService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    // Đăng nhập và lấy token
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    // Kiểm tra token
    @PostMapping("/introspect")
    public ResponseEntity<IntrospectResponse> introspect(@RequestBody IntrospectRequest request){
        return ResponseEntity.ok(authService.introspect(request));
    }

    // Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        String msg = authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        String msg = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", msg));
    }
}