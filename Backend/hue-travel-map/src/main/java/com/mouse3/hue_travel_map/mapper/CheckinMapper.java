package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.response.CheckinResponse;
import com.mouse3.hue_travel_map.entity.Checkin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CheckinImageMapper.class})
public interface CheckinMapper {
    
    @Mapping(source = "user.fullName", target = "userFullName")
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    @Mapping(source = "place.id", target = "placeId")
    @Mapping(source = "place.name", target = "placeName")
    @Mapping(source = "place.category.id", target = "categoryId")
    CheckinResponse toCheckinResponse(Checkin checkin);
}