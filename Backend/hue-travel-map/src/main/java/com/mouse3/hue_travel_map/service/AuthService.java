package com.mouse3.hue_travel_map.service;

import com.mouse3.hue_travel_map.dto.request.AuthRequest;
import com.mouse3.hue_travel_map.dto.request.ForgotPasswordRequest;
import com.mouse3.hue_travel_map.dto.request.IntrospectRequest;
import com.mouse3.hue_travel_map.dto.request.ResetPasswordRequest;
import com.mouse3.hue_travel_map.dto.response.AuthResponse;
import com.mouse3.hue_travel_map.dto.response.IntrospectResponse;
import com.mouse3.hue_travel_map.entity.User;
import com.mouse3.hue_travel_map.exception.AccountLockedException;
import com.mouse3.hue_travel_map.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    MailService mailService;

    @NonFinal
    @Value("${jwt.signerKey}")
    String jwtSignerKey;

    @NonFinal
    Map<String, OtpDetails> otpCache = new ConcurrentHashMap<>();

    private static final SecureRandom secureRandom = new SecureRandom();

    @Getter
    @AllArgsConstructor
    private static class OtpDetails {
        String code;
        LocalDateTime expiryTime;
    }

    // Kiểm tra token JWT có hợp lệ không
    public IntrospectResponse introspect(IntrospectRequest request){
        try{

            var token = request.getToken();
            
            JWSVerifier verifier = new MACVerifier(jwtSignerKey.getBytes());
            
            SignedJWT signedJWT = SignedJWT.parse(token);
            
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            
            var verified = signedJWT.verify(verifier);
            
            return IntrospectResponse.builder()
            .valid(verified && expirationTime.after(new Date()))
            .build();
        }
        catch (JOSEException | ParseException e){
            log.error("Lỗi khi kiểm tra token JWT: {}", e.getMessage());
            throw new RuntimeException("Không thể kiểm tra token JWT!");
            
        }
    }

    // Đăng nhập và lấy token
    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));
        boolean isMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
        
        if (!isMatch) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        if(!userRepository.existsByEmailAndIsActive(request.getEmail(), true)){
            throw new RuntimeException("Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên!");
        }

        var token = generateToken(user);

        return AuthResponse.builder()
                .authenticated(true)
                .token(token)
                .build();
    }

    // Tạo token JWT
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("huetravelmap.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                                Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("fullName", user.getFullName())
                .claim("scope", user.getRole())
                .build();
        
        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(jwtSignerKey.getBytes()));
            return jwsObject.serialize(); 
        } catch (JOSEException e) {
            log.error("Lỗi khi tạo token JWT: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo token JWT!");
        }
    }

    // Quên mật khẩu - Gửi mã OTP về email
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email không tồn tại trong hệ thống!");
        }

        // 
        OtpDetails existingOtp = otpCache.get(email);
        if (existingOtp != null && existingOtp.getExpiryTime().isAfter(LocalDateTime.now())){

            Duration remaining = Duration.between(LocalDateTime.now(), existingOtp.getExpiryTime());
            long minutes = remaining.toMinutes();
            long seconds = remaining.minusMinutes(minutes).getSeconds();

            throw new RuntimeException( String.format("OTP đã được gửi vào gmail của bạn. Vui lòng thử lại sau %d phút %d giây!",
                minutes,
                seconds
            ));
        }

        // Tạo OTP 6 số ngẫu nhiên
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        
        // Lưu vào RAM (Hết hạn sau 5 phút)
        otpCache.put(email, new OtpDetails(otp, LocalDateTime.now().plusMinutes(5)));

        // Gửi qua Gmail
        mailService.sendOtpEmail(email, otp);
        
        return "Mã xác thực đã được gửi tới Gmail của bạn.";
    }

    //Dọn dẹp các mã OTP đã hết hạn trong cache (chạy mỗi 1 phút)
    @Scheduled(fixedRate = 6000)
    public void cleanupExpiredOtp() {

        LocalDateTime now = LocalDateTime.now();

        otpCache.entrySet().removeIf(
                entry -> entry.getValue()
                            .getExpiryTime()
                            .isBefore(now)
        );
    }

    // Đặt lại mật khẩu sau khi xác thực OTP
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        OtpDetails savedOtp = otpCache.get(email);

        if (savedOtp == null) {
            throw new RuntimeException("Bạn chưa yêu cầu gửi mã OTP hoặc mã đã bị xóa!");
        }

        if (!savedOtp.getCode().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác!");
        }

        if (savedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpCache.remove(email); // Xóa mã hết hạn khỏi RAM
            throw new RuntimeException("Mã OTP đã hết hạn!");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        // Đổi mật khẩu
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa OTP sau khi thành công
        otpCache.remove(email);

        return "Đặt lại mật khẩu thành công!";
    }

    // Kiểm tra tài khoản có bị khóa không trước khi cho phép đăng nhập
    public void validateUserActive(String email) {
        if (!userRepository.existsByEmailAndIsActive(email, true)) {
            throw new AccountLockedException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên!");
        }
    }
}