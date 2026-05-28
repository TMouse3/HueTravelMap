package com.mouse3.hue_travel_map.config;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
public class SecurityConfig {
    
    @Value("${jwt.signerKey}")
    String jwtSignerKey;

    private final ActiveUserFilter activeUserFilter;

    public SecurityConfig(ActiveUserFilter activeUserFilter){
        this.activeUserFilter = activeUserFilter;
    }

    public String[] PUBLIC_GET_ENDPOINTS = {
        "/places", 
        "/places/*", 
        "/categories", 
        "/categories/*",
        "/images/**"
    };

    public String[] PUBLIC_POST_ENDPOINTS = {
        "/auth/login", 
        "/auth/introspect",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/users/register",
        "/chatAI/chat-with-image",
        "/visits/record"
    };

    // ----- CÁC API DÀNH CHO USER (VÀ ADMIN) -----
    public String[] USER_GET_ENDPOINTS = {
        "/checkins/verify-location", 
        "/checkins/my-history", 
        "/placesuggestions/my-history",
        "/users/my-profile"
    };

    public String[] USER_POST_ENDPOINTS = {
        "/checkins",        
        "/placesuggestions", 
        "/files/upload",
        "/files/upload-multiple"
    };

    public String[] USER_PUT_ENDPOINTS = {
        "/users/my-profile", 
        "/users/my-password"
    };

    public String[] USER_DELETE_ENDPOINTS = {
        "/checkins/*", // Cho phép xóa checkin theo ID
        "/placesuggestions/*" // Cho phép xóa đề xuất theo ID
    };

    // ----- CÁC API CHỈ DÀNH CHO ADMIN -----
    public String[] ADMIN_GET_ENDPOINTS = {
        "/users",
        "/checkins/admin/all",
        "/places/admin/all",
        "/placesuggestions/admin/all",
        "/categories/admin/all",
        "/admin/dashboard/**"
    };

    public String[] ADMIN_POST_ENDPOINTS = {
        "/places", 
        "/categories"
    };

    public String[] ADMIN_PUT_ENDPOINTS = {
        "/places/*", 
        "/places/*/toggle-status",
        "/categories/*", 
        "/placesuggestions/admin/*/approve",
        "/placesuggestions/admin/*/reject",
        "/users/admin/*/toggle-status"
    };

    public String[] ADMIN_DELETE_ENDPOINTS = {
        "/places/*", 
        "/categories/*"
    };


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(requests -> requests
            // Public
            .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
            .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()

            // Admin
            .requestMatchers(HttpMethod.GET, ADMIN_GET_ENDPOINTS).hasAuthority("SCOPE_ADMIN")
            .requestMatchers(HttpMethod.POST, ADMIN_POST_ENDPOINTS).hasAuthority("SCOPE_ADMIN")
            .requestMatchers(HttpMethod.PUT, ADMIN_PUT_ENDPOINTS).hasAuthority("SCOPE_ADMIN")
            .requestMatchers(HttpMethod.DELETE, ADMIN_DELETE_ENDPOINTS).hasAuthority("SCOPE_ADMIN")

            // User 
            .requestMatchers(HttpMethod.GET, USER_GET_ENDPOINTS).hasAnyAuthority("SCOPE_USER", "SCOPE_ADMIN")
            .requestMatchers(HttpMethod.POST, USER_POST_ENDPOINTS).hasAnyAuthority("SCOPE_USER", "SCOPE_ADMIN")
            .requestMatchers(HttpMethod.PUT, USER_PUT_ENDPOINTS).hasAnyAuthority("SCOPE_USER", "SCOPE_ADMIN")
            .requestMatchers(HttpMethod.DELETE, USER_DELETE_ENDPOINTS).hasAnyAuthority("SCOPE_USER", "SCOPE_ADMIN")

            // Any
            .anyRequest().authenticated());
            
            httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder()))
            );

            httpSecurity.addFilterAfter(activeUserFilter, BearerTokenAuthenticationFilter.class);

            httpSecurity.csrf(AbstractHttpConfigurer::disable);

            httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));
            
            return httpSecurity.build();
        }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(jwtSignerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
            .withSecretKey(secretKeySpec)
            .macAlgorithm(MacAlgorithm.HS512)
            .build();
    }
        
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
        return urlBasedCorsConfigurationSource;
    }
}
