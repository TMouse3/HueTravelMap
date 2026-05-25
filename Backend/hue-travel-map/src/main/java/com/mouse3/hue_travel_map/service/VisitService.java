package com.mouse3.hue_travel_map.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.mouse3.hue_travel_map.entity.SiteVisit;
import com.mouse3.hue_travel_map.repository.SiteVisitRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VisitService {
    SiteVisitRepository siteVisitRepository;

    public void recordVisit() {
        LocalDate today = LocalDate.now();
        
        // Tìm xem hôm nay đã có dòng dữ liệu nào chưa
        SiteVisit todayVisit = siteVisitRepository.findByVisitDate(today)
                .orElse(SiteVisit.builder().visitDate(today).visitCount(0L).build());
        
        // Cộng 1 và lưu lại
        todayVisit.setVisitCount(todayVisit.getVisitCount() + 1);
        siteVisitRepository.save(todayVisit);
    }
}
