package com.mouse3.hue_travel_map.controller;

import com.mouse3.hue_travel_map.dto.response.ChartDataResponse;
import com.mouse3.hue_travel_map.dto.response.DashboardSummaryResponse;
import com.mouse3.hue_travel_map.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/charts/visits")
    public ResponseEntity<List<ChartDataResponse>> getVisitChart(@RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getVisitChart(year));
    }

    @GetMapping("/charts/users")
    public ResponseEntity<List<ChartDataResponse>> getUserChart(@RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getUserChart(year));
    }

    @GetMapping("/charts/checkins")
    public ResponseEntity<List<ChartDataResponse>> getCheckinChart(@RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getCheckinChart(year));
    }
}