package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.request.CategoryRequest;
import com.mouse3.hue_travel_map.dto.response.CategoryResponse;
import com.mouse3.hue_travel_map.entity.Category;
import com.mouse3.hue_travel_map.mapper.CategoryMapper;
import com.mouse3.hue_travel_map.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    // 1. Tạo mới (Create)
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = categoryMapper.toCategory(request);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    //Lấy tất cả (Read All)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();
    }

    //Lấy tất cả (Read All) - Phiên bản dành cho admin, có phân trang và filter theo tên
    public Page<CategoryResponse> getAllCategoriesAdmin(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categoryPage;
        
        if (name != null && !name.trim().isEmpty()) {
            String searchName = "%" + name.trim() + "%";
            categoryPage = categoryRepository.findByNameContainingIgnoreCase(searchName, pageable);
        } else {
            categoryPage = categoryRepository.findAll(pageable);
        }
        
        return categoryPage.map(categoryMapper::toCategoryResponse);
    }

    //Lấy theo ID (Read by ID)
    public CategoryResponse getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        return categoryMapper.toCategoryResponse(category);
    }

    //Cập nhật (Update)
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        
        categoryMapper.updateCategory(category, request);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    // 5. Xóa (Delete)
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        
        // Tránh xóa danh mục nếu đang có địa điểm thuộc danh mục này
        if (category.getPlaces() != null && !category.getPlaces().isEmpty()) {
            throw new RuntimeException("Không thể xóa danh mục đang chứa địa điểm!");
        }

        categoryRepository.deleteById(id);
    }
}