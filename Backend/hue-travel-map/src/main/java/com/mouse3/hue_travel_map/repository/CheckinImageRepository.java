package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.CheckinImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CheckinImageRepository extends JpaRepository<CheckinImage, Integer> {
    
}
