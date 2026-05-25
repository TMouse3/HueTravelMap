package com.mouse3.hue_travel_map.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mouse3.hue_travel_map.service.ChatAIService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/chatAI")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatAIController {
    ChatAIService chatAIService;

    // Chat với AI bằng cách gửi file ảnh và tin nhắn
    @PostMapping("/chat-with-image")
    public String chatWithImage(@RequestParam(value = "files") List<MultipartFile> files ,
                                @RequestParam(value = "message", defaultValue = "") String message){
        return chatAIService.chatWithImage(files, message);
    }    
}
