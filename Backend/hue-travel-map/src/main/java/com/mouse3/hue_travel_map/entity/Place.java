package com.mouse3.hue_travel_map.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

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

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    // Nhiều Địa điểm thuộc 1 Danh mục
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 1 Địa điểm - Nhiều Ảnh phụ
    @OneToMany(mappedBy = "place", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlaceImage> images;

    // 1 Địa điểm - Nhiều Checkin (Comment/Rating)
    @OneToMany(mappedBy = "place", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("createdDate DESC")
    private List<Checkin> checkins;
}