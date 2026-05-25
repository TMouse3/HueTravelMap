package com.mouse3.hue_travel_map.config;

import com.mouse3.hue_travel_map.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class ActiveUserFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final HandlerExceptionResolver exceptionResolver;

    // Phải chỉ định @Qualifier("handlerExceptionResolver") để Spring biết lấy đúng Bean chuyển tiếp lỗi
    public ActiveUserFilter(AuthService authService, 
                            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver) {
        this.authService = authService;
        this.exceptionResolver = exceptionResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                // Đẩy logic kiểm tra sang AuthService
                authService.validateUserActive(auth.getName());
            }

            filterChain.doFilter(request, response);

        } catch (RuntimeException ex) {
            // Bắt lỗi từ AuthService và ĐẨY VÀO GlobalExceptionHandler (@ControllerAdvice) để trả ra chuẩn JSON
            exceptionResolver.resolveException(request, response, null, ex);
        }
    }
}