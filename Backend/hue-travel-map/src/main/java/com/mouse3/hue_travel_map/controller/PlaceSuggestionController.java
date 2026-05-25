package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.request.PlaceSuggestionRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceSuggestionHistoryResponse;
import com.mouse3.hue_travel_map.dto.response.PlaceSuggestionResponse;
import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;
import com.mouse3.hue_travel_map.service.PlaceSuggestionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/placesuggestions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlaceSuggestionController {

    PlaceSuggestionService suggestionService;

    // [USER] Tạo mới kiến nghị thêm địa điểm
    @PostMapping
    public ResponseEntity<PlaceSuggestionResponse> create(@RequestBody @Valid PlaceSuggestionRequest request) {
        return ResponseEntity.ok(suggestionService.createSuggestion(request));
    }

    // [USER] Lấy lịch sử kiến nghị của bản thân, có filter theo tên địa điểm và trạng thái, có phân trang
    @GetMapping("/my-history")
public ResponseEntity<PlaceSuggestionHistoryResponse> getMyHistory(
        @RequestParam(required = false) String name, // Thêm tìm kiếm theo tên
        @RequestParam(required = false) SuggestionStatus status, // Thêm lọc theo trạng thái
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(suggestionService.getMySuggestions(name, status, page, size));
}

    // [ADMIN] Lấy tất cả kiến nghị, có filter theo tên địa điểm và trạng thái, có phân trang
    @GetMapping("/admin/all")
    public ResponseEntity<Page<PlaceSuggestionResponse>> getAllForAdmin(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) SuggestionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(suggestionService.getAllSuggestionsForAdmin(name, status, page, size));
    }

    // [ADMIN] Duyệt kiến nghị
    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<Map<String, String>> approveSuggestion(@PathVariable Integer id) {
        String msg = suggestionService.approveSuggestion(id);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // [ADMIN] Từ chối kiến nghị
    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectSuggestion(@PathVariable Integer id) {
        String msg = suggestionService.rejectSuggestion(id);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // [ADMIN] Xóa kiến nghị
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSuggestion(@PathVariable Integer id) {
        suggestionService.deleteSuggestion(id);
        return ResponseEntity.ok("Xóa kiến nghị thành công!");
    }
}