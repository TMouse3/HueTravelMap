package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.response.CheckinImageResponse;
import com.mouse3.hue_travel_map.entity.CheckinImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CheckinImageMapper {
    CheckinImageResponse toCheckinImageResponse(CheckinImage checkinImage);
}