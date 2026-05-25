package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.SiteVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, Integer> {
    // Tìm bản ghi SiteVisit theo ngày (dùng để cập nhật số lượt truy cập hàng ngày)
    Optional<SiteVisit> findByVisitDate(LocalDate date);

    // Tổng lượt truy cập
    @Query("SELECT SUM(s.visitCount) FROM SiteVisit s")
    Long getTotalVisits();

    // Tổng lượt truy cập trong khoảng thời gian (dùng cho thống kê)
    @Query("SELECT SUM(s.visitCount) FROM SiteVisit s WHERE s.visitDate >= :startDate AND s.visitDate <= :endDate")
    Long sumVisitsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Thống kê lượt truy cập theo tháng trong năm
    @Query("SELECT MONTH(s.visitDate) as month, SUM(s.visitCount) as count FROM SiteVisit s WHERE YEAR(s.visitDate) = :year GROUP BY MONTH(s.visitDate)")
    List<Object[]> getMonthlyVisits(@Param("year") int year);

    // Lấy danh sách năm có lượt truy cập (dùng để hiển thị filter theo năm)
    @Query("SELECT DISTINCT YEAR(s.visitDate) FROM SiteVisit s ORDER BY YEAR(s.visitDate) DESC")
    List<Integer> getAvailableYears();
}