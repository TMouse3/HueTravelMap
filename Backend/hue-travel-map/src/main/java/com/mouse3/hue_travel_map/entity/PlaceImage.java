package com.mouse3.hue_travel_map.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "place_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "VARCHAR(MAX)")
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggestion_id")
    private PlaceSuggestion suggestion;
}