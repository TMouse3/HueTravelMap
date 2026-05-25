// hue_travel_map/dto/response/DashboardSummaryResponse.java
package com.mouse3.hue_travel_map.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardSummaryResponse {
    // Truy cập
    private long todayVisits;
    private long monthVisits;
    private long totalVisits;

    // Người dùng
    private long todayUsers;
    private long monthUsers;
    private long totalUsers;

    // Check-in
    private long todayCheckins;
    private long monthCheckins;
    private long totalCheckins;

    private long totalPlaces;
    private long pendingSuggestions;

    private List<Integer> availableVisitYears;
    private List<Integer> availableUserYears;
    private List<Integer> availableCheckinYears;

    private List<PlaceRanking> top5Week;
    private List<PlaceRanking> top5Month;
    private List<PlaceRanking> top5AllTime;
    private List<PlaceSuggestionResponse> todaySuggestions;

    @Getter @Setter @Builder
    public static class PlaceRanking {
        private Integer placeId;
        private String placeName;
        private String thumbnailUrl;
        private long checkinCount;
        private double averageRating;
    }
}