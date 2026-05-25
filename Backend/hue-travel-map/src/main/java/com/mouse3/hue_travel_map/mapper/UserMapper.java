package com.mouse3.hue_travel_map.mapper;

import org.mapstruct.Mapper;

import com.mouse3.hue_travel_map.dto.request.UserCreatRequest;
import com.mouse3.hue_travel_map.dto.response.UserResponse;
import com.mouse3.hue_travel_map.entity.User;

@Mapper (componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreatRequest request);

    UserResponse toUserResponse(User user);
}
