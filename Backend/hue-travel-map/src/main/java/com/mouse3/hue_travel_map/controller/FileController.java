package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {

    FileService fileService;

    // Tải lên một file ảnh
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        String filename = fileService.uploadImage(file);
        return ResponseEntity.ok(filename);
    }

    // Tải lên nhiều file ảnh (tối đa 3 file)
    @PostMapping("/upload-multiple")
    public ResponseEntity<List<String>> uploadMultipleImages(@RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(fileService.uploadMultipleImages(files));
    }
}