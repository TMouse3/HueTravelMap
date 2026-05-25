package com.mouse3.hue_travel_map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "checkin_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "VARCHAR(MAX)")
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkin_id")
    private Checkin checkin;
}