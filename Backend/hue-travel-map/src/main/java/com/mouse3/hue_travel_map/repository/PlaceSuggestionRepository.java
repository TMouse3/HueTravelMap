package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.PlaceSuggestion;
import com.mouse3.hue_travel_map.entity.User;
import com.mouse3.hue_travel_map.entity.enums.SuggestionStatus;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceSuggestionRepository extends JpaRepository<PlaceSuggestion, Integer> {
    // Lịch sử của User (Phân trang)
    Page<PlaceSuggestion> findAllByUserOrderByCreatedDateDesc(User user, Pageable pageable);

    // Lịch sử của User với bộ lọc (tên địa điểm và trạng thái)
    @Query("SELECT p FROM PlaceSuggestion p WHERE p.user = :user " +
           "AND (:name IS NULL OR p.name LIKE :name) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "ORDER BY p.createdDate DESC")
    Page<PlaceSuggestion> findByUserCriteria(
            @Param("user") User user, 
            @Param("name") String name, 
            @Param("status") SuggestionStatus status, 
            Pageable pageable);

    // Admin xem tất cả kiến nghị với bộ lọc (tên địa điểm và trạng thái)
    @Query("SELECT ps FROM PlaceSuggestion ps " +
           "JOIN FETCH ps.user " +      // Lấy kèm thông tin User
           "JOIN FETCH ps.category " +  // Lấy kèm thông tin Category
           "WHERE (:name IS NULL OR ps.name LIKE :name) " +
           "AND (:status IS NULL OR ps.status = :status)")
    Page<PlaceSuggestion> findAllAdmin(@Param("name") String name, @Param("status") SuggestionStatus status, Pageable pageable);

    // Đếm tổng số kiến nghị đã được duyệt của 1 user
    long countByUserAndStatus(User user, SuggestionStatus status);

    // Đếm số kiến nghị user đã gửi từ một mốc thời gian (dùng để chặn spam theo ngày)
    long countByUserAndCreatedDateAfter(User user, LocalDateTime date);

    // Đếm số kiến nghị theo trạng thái (dùng cho thống kê)
    long countByStatus(SuggestionStatus status);

    // Lấy danh sách kiến nghị đã được duyệt trong khoảng thời gian (dùng cho thống kê)
    List<PlaceSuggestion> findAllByCreatedDateBetweenOrderByCreatedDateDesc(LocalDateTime start, LocalDateTime end);
}
