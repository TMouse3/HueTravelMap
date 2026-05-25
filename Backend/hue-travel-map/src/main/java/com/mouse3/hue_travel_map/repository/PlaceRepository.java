package com.mouse3.hue_travel_map.repository;

import com.mouse3.hue_travel_map.entity.Place;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface PlaceRepository extends JpaRepository<Place, Integer> {
    // Lấy tất cả địa điểm để hiển thị trên bản đồ (dành cho User)
    // Trả về: Object[0] = Place, Object[1] = Avg Rating, Object[2] = Total Check-ins
    @Query("SELECT p, COALESCE(AVG(c.rating), 0.0), COUNT(c.id) " +
           "FROM Place p LEFT JOIN p.checkins c " +
           "WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "GROUP BY p")
    List<Object[]> findAllPlacesForMap(@Param("categoryId") Integer categoryId);

    // Admin lọc theo tên và categoryId
    @Query("SELECT p FROM Place p JOIN FETCH p.category " +
           "WHERE (:name IS NULL OR p.name LIKE :name) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Place> findAllAdmin(@Param("name") String name, @Param("categoryId") Integer categoryId, Pageable pageable);

    // AI lấy context: tên địa điểm, tên danh mục, đánh giá trung bình, số check-in
    @Query("SELECT p.name, cat.name, COALESCE(AVG(chk.rating), 0.0), COUNT(chk.id) " +
           "FROM Place p " +
           "LEFT JOIN p.category cat " +
           "LEFT JOIN p.checkins chk " +
           "WHERE p.isActive = true " +
           "GROUP BY p.name, cat.name")
    List<Object[]> getPlacesContextForAI();
}
