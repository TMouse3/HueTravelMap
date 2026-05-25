package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.request.PasswordChangeRequest;
import com.mouse3.hue_travel_map.dto.request.UserCreatRequest;
import com.mouse3.hue_travel_map.dto.request.UserProfileUpdateRequest;
import com.mouse3.hue_travel_map.dto.response.UserResponse;
import com.mouse3.hue_travel_map.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    // [PUBLIC] Đăng ký
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid UserCreatRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    // [USER] Xem thông tin cá nhân
    @GetMapping("/my-profile")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    // [USER] Cập nhật Profile (Tên, Avatar)
    @PutMapping("/my-profile")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody @Valid UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    // [USER] Đổi mật khẩu
    @PutMapping("/my-password")
    public ResponseEntity<Map<String, String>> changeMyPassword(@RequestBody @Valid PasswordChangeRequest request) {
        String message = userService.changeMyPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // [ADMIN] Lấy danh sách người dùng, có phân trang và tìm kiếm theo tên hoặc email
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getUsers(search, isActive, page, size));
    }

    // [ADMIN] KHÓA / MỞ KHÓA TÀI KHOẢN NGƯỜI DÙNG ---
    @PutMapping("/admin/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }
}