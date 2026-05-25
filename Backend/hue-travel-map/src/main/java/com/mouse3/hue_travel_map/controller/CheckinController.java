package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.request.CheckinRequest;
import com.mouse3.hue_travel_map.dto.request.VerifyLocationRequest;
import com.mouse3.hue_travel_map.dto.response.CheckinHistoryResponse;
import com.mouse3.hue_travel_map.dto.response.CheckinResponse;
import com.mouse3.hue_travel_map.service.CheckinService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkins")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckinController {

    CheckinService checkinService;

    // [USER] Lấy lịch sử check-in của mình, có filter theo tên địa điểm và rating, có phân trang
    @GetMapping("/my-history")
    public ResponseEntity<CheckinHistoryResponse> getMyHistory( // <-- ĐỔI THÀNH CheckinHistoryResponse
            @RequestParam(required = false) String placeName,
            @RequestParam(required = false) Byte rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(checkinService.getMyHistory(placeName, rating, page, size));
    }

    // [ADMIN] Lấy tất cả check-in, có filter theo tên địa điểm và rating, có phân trang
    @GetMapping("/admin/all")
    public ResponseEntity<Page<CheckinResponse>> getAllCheckinsAdmin(
            @RequestParam(required = false) Integer placeId,
            @RequestParam(required = false) Byte rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(checkinService.getAllCheckinsAdmin(placeId, rating, page, size));
    }

    // [USER] Verify tọa độ
    @GetMapping("/verify-location")
    public ResponseEntity<Boolean> verifyLocation(@Valid @ModelAttribute VerifyLocationRequest request) {
        boolean isValid = checkinService.verifyCheckinLocation(
                request.getPlaceId(), 
                request.getUserLat(), 
                request.getUserLng()
        );
        return ResponseEntity.ok(isValid);
    }

    // [USER] Gửi Check-in
    @PostMapping
    public ResponseEntity<CheckinResponse> createCheckin(@RequestBody @Valid CheckinRequest request) {
        return ResponseEntity.ok(checkinService.createCheckin(request));
    }

    // [ADMIN] Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCheckin(@PathVariable Integer id) {
        checkinService.deleteCheckin(id);
        return ResponseEntity.ok("Xóa check-in thành công!");
    }
}