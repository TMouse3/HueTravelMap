package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.request.CategoryRequest;
import com.mouse3.hue_travel_map.dto.response.CategoryResponse;
import com.mouse3.hue_travel_map.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryRequest request);

    CategoryResponse toCategoryResponse(Category category);
    
    void updateCategory(@MappingTarget Category category, CategoryRequest request);
}