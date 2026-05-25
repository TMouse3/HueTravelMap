package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Tìm user theo email
    Optional<User> findByEmail(String email);
    
    // Kiểm tra xem email đã tồn tại trong database chưa
    boolean existsByEmail(String email);

    // Tìm user theo email và trạng thái hoạt động (dùng cho đăng nhập)
    long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

    // Thống kê số user theo tháng trong năm
    @Query("SELECT MONTH(u.createdDate) as month, COUNT(u) as count FROM User u WHERE YEAR(u.createdDate) = :year GROUP BY MONTH(u.createdDate)")
    List<Object[]> getMonthlyUsers(@Param("year") int year);

    // Lấy danh sách năm có user đăng ký (dùng để hiển thị filter theo năm)
    @Query("SELECT DISTINCT YEAR(u.createdDate) FROM User u ORDER BY YEAR(u.createdDate) DESC")
    List<Integer> getAvailableYears();

    // Admin xem và lọc user
    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR u.fullName LIKE :search OR u.email LIKE :search)" +
            " AND (:isActive IS NULL OR u.isActive = :isActive) ")
    Page<User> findAllAdmin(@Param("search") String search, @Param("isActive") Boolean isActive, Pageable pageable);

    // Kiểm tra email đã tồn tại và đang active (dùng để chặn đăng ký trùng email)
    boolean existsByEmailAndIsActive(String email, Boolean isActive);
}
