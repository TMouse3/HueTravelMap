package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.Checkin;
import com.mouse3.hue_travel_map.entity.Place;
import com.mouse3.hue_travel_map.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Integer> {
    
    // Tìm bản ghi check-in gần nhất để tính Cooldown 6h
    Optional<Checkin> findTopByUserAndPlaceOrderByCreatedDateDesc(User user, Place place);

    // User xem lịch sử
    Page<Checkin> findAllByUserOrderByCreatedDateDesc(User user, Pageable pageable);

    // User xem lịch sử với bộ lọc (tên địa điểm và đánh giá)
    @Query("SELECT c FROM Checkin c JOIN c.place p WHERE c.user = :user " +
           "AND (:placeName IS NULL OR p.name LIKE :placeName) " +
           "AND (:rating IS NULL OR c.rating = :rating) " +
           "ORDER BY c.createdDate DESC")
    Page<Checkin> findByUserCriteria(@Param("user") User user, @Param("placeName") String placeName, @Param("rating") Byte rating, Pageable pageable);

    // Đếm tổng số check-in của user
    long countByUser(User user);

    // Đếm số địa điểm khác nhau mà user đã check-in
    @Query("SELECT COUNT(DISTINCT c.place.id) FROM Checkin c WHERE c.user = :user")
    long countDistinctPlacesByUser(@Param("user") User user);

    // Admin xem và lọc checkin
    @Query("SELECT c FROM Checkin c WHERE (:placeId IS NULL OR c.place.id = :placeId) " +
           "AND (:rating IS NULL OR c.rating = :rating)")
    Page<Checkin> findAllAdmin(@Param("placeId") Integer placeId, @Param("rating") Byte rating, Pageable pageable);

    // Đếm số check-in trong khoảng thời gian (dùng cho thống kê)
    long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

    // Thống kê số check-in theo tháng trong năm
    @Query("SELECT MONTH(c.createdDate) as month, COUNT(c) as count FROM Checkin c WHERE YEAR(c.createdDate) = :year GROUP BY MONTH(c.createdDate)")
    List<Object[]> getMonthlyCheckins(@Param("year") int year);

    // Top 5 check-in tổng
    @Query("SELECT c.place, COUNT(c) as checkinCount FROM Checkin c GROUP BY c.place ORDER BY checkinCount DESC")
    List<Object[]> getTopPlacesAllTime(Pageable pageable);

    // Top 5 check-in trong khoảng thời gian (tháng này)
    @Query("SELECT c.place, COUNT(c) as checkinCount FROM Checkin c WHERE c.createdDate >= :start AND c.createdDate <= :end GROUP BY c.place ORDER BY checkinCount DESC")
    List<Object[]> getTopPlacesBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    // Lấy danh sách năm có check-in để hiển thị dropdown
    @Query("SELECT DISTINCT YEAR(c.createdDate) FROM Checkin c ORDER BY YEAR(c.createdDate) DESC")
    List<Integer> getAvailableYears();

}