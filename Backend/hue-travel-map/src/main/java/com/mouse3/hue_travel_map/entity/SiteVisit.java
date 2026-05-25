package com.mouse3.hue_travel_map.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "site_visits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "visit_date", unique = true, nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_count", nullable = false)
    private Long visitCount;
}