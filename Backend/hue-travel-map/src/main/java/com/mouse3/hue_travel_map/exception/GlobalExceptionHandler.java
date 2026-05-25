package com.mouse3.hue_travel_map.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<Map<String, String>> handlingRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(value = AccountLockedException.class)
    ResponseEntity<Map<String, String>> handlingAccountLockedException(AccountLockedException e) {
        return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> handlingValidation(MethodArgumentNotValidException e) {
        String errorMessage = e.getFieldError().getDefaultMessage();
        return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<Map<String, String>> handlingException(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Lỗi hệ thống, vui lòng thử lại sau!"));
    }
}