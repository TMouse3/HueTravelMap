package com.mouse3.hue_travel_map.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mouse3.hue_travel_map.dto.request.PasswordChangeRequest;
import com.mouse3.hue_travel_map.dto.request.UserCreatRequest;
import com.mouse3.hue_travel_map.dto.request.UserProfileUpdateRequest;
import com.mouse3.hue_travel_map.dto.response.UserResponse;
import com.mouse3.hue_travel_map.entity.User;
import com.mouse3.hue_travel_map.entity.enums.Role;
import com.mouse3.hue_travel_map.mapper.UserMapper;
import com.mouse3.hue_travel_map.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    // [USER] Đăng ký tài khoản mới
    public UserResponse createUser(UserCreatRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    // [USER] Lấy thông tin của chính mình
    public UserResponse getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        
        return userMapper.toUserResponse(user);
    }

    // [USER] Cập nhật thông tin cá nhân (Tên, Avatar) - Không cho phép cập nhật email
    @Transactional
    public UserResponse updateMyProfile(UserProfileUpdateRequest request) {
        // Lấy Email từ Token (Chống hack ID)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        user.setFullName(request.getFullName());
        
        if (request.getAvatarUrl() == null || request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(null);
        } else {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // [USER] Đổi mật khẩu
    @Transactional
    public String changeMyPassword(PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // 1. Kiểm tra mật khẩu cũ có đúng không?
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // 2. Kiểm tra mật khẩu mới và xác nhận có khớp không?
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp với mật khẩu mới!");
        }

        // 3. Kiểm tra mật khẩu mới có trùng mật khẩu cũ không (Tùy chọn UX)
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ!");
        }

        // 4. Lưu mật khẩu mới đã mã hóa
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Đổi mật khẩu thành công!";
    }

    // [ADMIN] Lấy danh sách tất cả người dùng, có filter theo tên và email, có phân trang
    public Page<UserResponse> getUsers(String search, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        // Chuẩn hóa từ khóa tìm kiếm cho câu lệnh LIKE trong SQL
        String searchFilter = (search != null && !search.trim().isEmpty()) ? "%" + search.trim() + "%" : null;
        
        return userRepository.findAllAdmin(searchFilter, isActive, pageable)
                .map(userMapper::toUserResponse);
    }

    // [ADMIN] Khóa/Mở khóa tài khoản người dùng (Không cho phép tự khóa chính mình)
    @Transactional
    public UserResponse toggleUserStatus(Integer id) {
        // Lấy thông tin admin đang thao tác từ Security Context để chặn tự khóa chính mình
        String currentAdminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("Tài khoản Quản trị không tồn tại!"));

        if (currentAdmin.getId().equals(id)) {
            throw new RuntimeException("Bạn không thể tự khóa tài khoản quản trị của chính mình!");
        }

        // Tìm tài khoản mục tiêu cần xử lý khóa/mở khóa
        User userToToggle = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản cần xử lý không tồn tại trên hệ thống!"));

        // Đảo ngược trạng thái hoạt động (true -> false hoặc false -> true)
        userToToggle.setIsActive(!userToToggle.getIsActive());
        
        return userMapper.toUserResponse(userRepository.save(userToToggle));
    }
}