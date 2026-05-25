package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.request.PlaceRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceResponse;
import com.mouse3.hue_travel_map.entity.Place;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, PlaceImageMapper.class, CheckinMapper.class})
public interface PlaceMapper {

    // MAPPER 1: Dùng cho lấy chi tiết (Có đẩy đủ Checkin và Ảnh phụ)
    @Mapping(target = "category", ignore = true)
    Place toPlace(PlaceRequest request);

    @Mapping(target = "averageRating", ignore = true)
    PlaceResponse toPlaceResponse(Place place);

    // MAPPER 2: Dùng cho gọi danh sách Bản đồ (Cắt bỏ Checkin và Ảnh phụ cho nhẹ)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "checkins", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    PlaceResponse toPlaceResponseForList(Place place);

    @Mapping(target = "category", ignore = true)
    void updatePlace(@MappingTarget Place place, PlaceRequest request);
}