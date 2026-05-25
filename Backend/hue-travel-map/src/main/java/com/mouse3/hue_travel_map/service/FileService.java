package com.mouse3.hue_travel_map.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống!");
        }

        try {
            // 1. Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Lấy tên file gốc và đuôi mở rộng (VD: .jpg, .png)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // 3. Đổi tên file bằng UUID để đảm bảo không bao giờ trùng lặp
            String newFilename = UUID.randomUUID().toString() + extension;

            // 4. Copy file từ luồng mạng vào ổ đĩa D:
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Trả về tên file mới để Frontend dùng
            return newFilename;

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage());
        }
    }

    // Tải lên nhiều file ảnh (tối đa 3 file)
    public List<String> uploadMultipleImages(List<MultipartFile> files) {
        if (files.size() > 3) {
            throw new RuntimeException("Hệ thống chỉ cho phép tải lên tối đa 3 ảnh cùng lúc!");
        }

        // Dùng Stream để lặp qua từng file, upload và trả về danh sách tên file mới
        return files.stream()
                .map(this::uploadImage) // Gọi lại hàm upload 1 file ở trên
                .toList();
    }
}