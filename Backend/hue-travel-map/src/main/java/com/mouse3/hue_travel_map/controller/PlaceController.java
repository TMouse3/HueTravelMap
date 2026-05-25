package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.request.PlaceRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceResponse;
import com.mouse3.hue_travel_map.service.PlaceService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlaceController {

    PlaceService placeService;

    // [PUBLIC] Lấy danh sách nhẹ hiển thị lên bản đồ (Marker)
    @GetMapping
    public ResponseEntity<List<PlaceResponse>> getAllPlaces(
            @RequestParam(required = false) Integer categoryId) {
        return ResponseEntity.ok(placeService.getAllPlaces(categoryId));
    }

    // [PUBLIC] Lấy danh sách top 5 địa điểm được check-in nhiều nhất trong ngày, tuần, tháng, năm hoặc tất cả thời gian
    @GetMapping("/top")
    public ResponseEntity<List<PlaceResponse>> getTopPlaces(
            @RequestParam(defaultValue = "allTime") String time) {
        return ResponseEntity.ok(placeService.getTopPlaces(time));
    }

    // [PUBLIC] Lấy chi tiết khi click vào hiển thị Sidebar
    @GetMapping("/{id}")
    public ResponseEntity<PlaceResponse> getPlaceById(@PathVariable Integer id) {
        return ResponseEntity.ok(placeService.getPlaceById(id));
    }

    // [ADMIN] Lấy tất cả địa điểm, có filter theo tên và danh mục, có phân trang
    @GetMapping("/admin/all")
    public ResponseEntity<Page<PlaceResponse>> getAllAdmin(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(placeService.getAllPlacesAdmin(name, categoryId, page, size));
    }

    // [ADMIN] Thêm địa điểm mới
    @PostMapping
    public ResponseEntity<PlaceResponse> createPlace(@RequestBody @Valid PlaceRequest request) {
        return ResponseEntity.ok(placeService.createPlace(request));
    }

    // [ADMIN] Cập nhật thông tin địa điểm
    @PutMapping("/{id}")
    public ResponseEntity<PlaceResponse> updatePlace(@PathVariable Integer id, @RequestBody @Valid PlaceRequest request) {
        return ResponseEntity.ok(placeService.updatePlace(id, request));
    }

    // [ADMIN] Thay đổi trạng thái ẩn hiện của địa điểm (toggle)
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<PlaceResponse> togglePlaceStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(placeService.togglePlaceStatus(id));
    }

    // [ADMIN] Xóa địa điểm khỏi Database
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePlace(@PathVariable Integer id) {
        placeService.deletePlace(id);
        return ResponseEntity.ok("Xóa địa điểm thành công!");
    }
}