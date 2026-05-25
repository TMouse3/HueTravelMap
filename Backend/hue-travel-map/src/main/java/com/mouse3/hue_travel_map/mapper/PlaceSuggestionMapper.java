package com.mouse3.hue_travel_map.mapper;

import com.mouse3.hue_travel_map.dto.request.PlaceSuggestionRequest;
import com.mouse3.hue_travel_map.dto.response.PlaceSuggestionResponse;
import com.mouse3.hue_travel_map.entity.PlaceSuggestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, PlaceImageMapper.class})
public interface PlaceSuggestionMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "category", ignore = true)
    PlaceSuggestion toEntity(PlaceSuggestionRequest request);

    @Mapping(source = "user.fullName", target = "userFullName")
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    PlaceSuggestionResponse toResponse(PlaceSuggestion suggestion);
}