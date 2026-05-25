package com.mouse3.hue_travel_map.entity;

import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "place_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(precision = 10, scale = 8, nullable = false)
    private BigDecimal lat;

    @Column(precision = 11, scale = 8, nullable = false)
    private BigDecimal lng;

    @Column(name = "thumbnail_url", columnDefinition = "VARCHAR(MAX)")
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SuggestionStatus status;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "suggestion", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PlaceImage> images;
}