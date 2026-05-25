package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.response.ChartDataResponse;
import com.mouse3.hue_travel_map.dto.response.DashboardSummaryResponse;
import com.mouse3.hue_travel_map.entity.Place;
import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;
import com.mouse3.hue_travel_map.mapper.PlaceSuggestionMapper;
import com.mouse3.hue_travel_map.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final CheckinRepository checkinRepository;
    private final PlaceSuggestionRepository suggestionRepository;
    private final SiteVisitRepository siteVisitRepository;
    private final PlaceSuggestionMapper suggestionMapper;

    // 1. API Lấy Tổng quan
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        LocalDate todayDate = LocalDate.now();
        LocalDateTime startOfDay = todayDate.atStartOfDay();
        LocalDateTime endOfDay = todayDate.atTime(LocalTime.MAX);
        
        LocalDate startOfWeekDate = todayDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();

        LocalDate startOfMonthDate = todayDate.withDayOfMonth(1);
        LocalDateTime startOfMonth = startOfMonthDate.atStartOfDay();

        // Tính toán con số
        Long totalVisits = siteVisitRepository.getTotalVisits();
        Long todayVisits = siteVisitRepository.findByVisitDate(todayDate).map(v -> v.getVisitCount()).orElse(0L);
        Long monthVisits = siteVisitRepository.sumVisitsBetween(startOfMonthDate, todayDate);

        return DashboardSummaryResponse.builder()
                .todayVisits(todayVisits)
                .monthVisits(monthVisits != null ? monthVisits : 0)
                .totalVisits(totalVisits != null ? totalVisits : 0)
                
                .todayUsers(userRepository.countByCreatedDateBetween(startOfDay, endOfDay))
                .monthUsers(userRepository.countByCreatedDateBetween(startOfMonth, endOfDay))
                .totalUsers(userRepository.count())

                .todayCheckins(checkinRepository.countByCreatedDateBetween(startOfDay, endOfDay))
                .monthCheckins(checkinRepository.countByCreatedDateBetween(startOfMonth, endOfDay))
                .totalCheckins(checkinRepository.count())

                .totalPlaces(placeRepository.count())
                .pendingSuggestions(suggestionRepository.countByStatus(SuggestionStatus.PENDING))
                
                .availableVisitYears(ensureYear(siteVisitRepository.getAvailableYears(), todayDate.getYear()))
                .availableUserYears(ensureYear(userRepository.getAvailableYears(), todayDate.getYear()))
                .availableCheckinYears(ensureYear(checkinRepository.getAvailableYears(), todayDate.getYear()))
                
                .top5Week(checkinRepository.getTopPlacesBetween(startOfWeek, endOfDay , PageRequest.of(0, 5))
                        .stream().map(this::mapToPlaceRanking).toList())
                .top5Month(checkinRepository.getTopPlacesBetween(startOfMonth, endOfDay, PageRequest.of(0, 5))
                        .stream().map(this::mapToPlaceRanking).toList())
                .top5AllTime(checkinRepository.getTopPlacesAllTime(PageRequest.of(0, 5))
                        .stream().map(this::mapToPlaceRanking).toList())
                .todaySuggestions(suggestionRepository.findAllByCreatedDateBetweenOrderByCreatedDateDesc(startOfDay, endOfDay)
                        .stream().map(suggestionMapper::toResponse).toList())
                .build();
    }

    // 2. API Lấy biểu đồ Lượt truy cập
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getVisitChart(int year) {
        return buildChartData(siteVisitRepository.getMonthlyVisits(year));
    }

    // 3. API Lấy biểu đồ Người dùng
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getUserChart(int year) {
        return buildChartData(userRepository.getMonthlyUsers(year));
    }

    // 4. API Lấy biểu đồ Check-in
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getCheckinChart(int year) {
        return buildChartData(checkinRepository.getMonthlyCheckins(year));
    }


    // Đảm bảo luôn có năm hiện tại trong danh sách (kể cả khi chưa có dữ liệu)
    private List<Integer> ensureYear(List<Integer> years, int currentYear) {
        List<Integer> mutableYears = new ArrayList<>(years);
        if (!mutableYears.contains(currentYear)) {
            mutableYears.add(currentYear);
        }
        return mutableYears;
    }

    // Chuyển đổi dữ liệu từ DB thành định dạng biểu đồ
    private List<ChartDataResponse> buildChartData(List<Object[]> dbData) {
        List<ChartDataResponse> chart = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            chart.add(ChartDataResponse.builder().month("T" + i).value(0).build());
        }
        for (Object[] row : dbData) {
            int month = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            chart.get(month - 1).setValue(count);
        }
        return chart;
    }

    // Chuyển đổi kết quả truy vấn top places thành DTO trả về cho Dashboard
    private DashboardSummaryResponse.PlaceRanking mapToPlaceRanking(Object[] row) {
        Place place = (Place) row[0];
        long checkinCount = ((Number) row[1]).longValue();
        double avgRating = 0.0;
        if (place.getCheckins() != null && !place.getCheckins().isEmpty()) {
            avgRating = place.getCheckins().stream().mapToInt(c -> c.getRating()).average().orElse(0.0);
        }
        return DashboardSummaryResponse.PlaceRanking.builder()
                .placeId(place.getId())
                .placeName(place.getName())
                .thumbnailUrl(place.getThumbnailUrl())
                .checkinCount(checkinCount)
                .averageRating(Math.round(avgRating*10.0)/10.0)
                .build();
    }
}