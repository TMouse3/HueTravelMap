package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.service.VisitService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    // Ghi nhận một lượt truy cập mới
    @PostMapping("/record")
    public ResponseEntity<Void> recordVisit() {
        visitService.recordVisit();
        
        return ResponseEntity.ok().build();
    }
}