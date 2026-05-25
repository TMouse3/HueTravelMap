package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.response.PlaceImageResponse;
import com.mouse3.hue_travel_map.entity.PlaceImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PlaceImageMapper {
    PlaceImageResponse toPlaceImageResponse(PlaceImage placeImage);
}