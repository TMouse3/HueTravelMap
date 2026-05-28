package com.mouse3.hue_travel_map.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
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

    // Các MIME type được phép
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    // Các extension được phép
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    public String uploadImage(MultipartFile file) {

        // 1. Check file rỗng
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống!");
        }

        try {
            // 2. Check MIME type
            String contentType = file.getContentType();

            if (contentType == null ||
                    !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {

                throw new RuntimeException(
                        "Chỉ cho phép upload file ảnh JPG, JPEG, PNG hoặc WEBP!"
                );
            }

            // 3. Lấy tên file và extension
            String originalFilename = file.getOriginalFilename();

            String extension = "";

            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension = originalFilename
                        .substring(originalFilename.lastIndexOf("."))
                        .toLowerCase();
            }

            // 4. Check extension
            if (!ALLOWED_EXTENSIONS.contains(extension)) {

                throw new RuntimeException(
                        "Định dạng file không hợp lệ!"
                );
            }

            // 5. Verify file thật sự là ảnh
            BufferedImage image = ImageIO.read(file.getInputStream());

            if (image == null) {
                throw new RuntimeException(
                        "File upload không phải ảnh hợp lệ!"
                );
            }

            // 6. Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 7. Đổi tên file bằng UUID
            String newFilename =
                    UUID.randomUUID().toString() + extension;

            // 8. Lưu file xuống ổ đĩa
            Path filePath = uploadPath.resolve(newFilename);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // 9. Trả tên file cho frontend
            return newFilename;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Lỗi khi lưu file: " + e.getMessage()
            );
        }
    }

    // Upload nhiều ảnh (tối đa 3 file)
    public List<String> uploadMultipleImages(
            List<MultipartFile> files
    ) {

        if (files.size() > 3) {

            throw new RuntimeException(
                    "Hệ thống chỉ cho phép tải lên tối đa 3 ảnh cùng lúc!"
            );
        }

        // Upload từng file rồi trả về danh sách tên file mới
        return files.stream()
                .map(this::uploadImage)
                .toList();
    }
}