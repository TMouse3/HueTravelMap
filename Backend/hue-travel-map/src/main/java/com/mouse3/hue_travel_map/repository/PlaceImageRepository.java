package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.PlaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceImageRepository extends JpaRepository<PlaceImage, Integer> {
    
}
