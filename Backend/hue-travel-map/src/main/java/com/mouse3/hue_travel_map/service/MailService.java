package com.mouse3.hue_travel_map.service;

import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailService {

    final JavaMailSender mailSender;

    @NonFinal
    @Value("${spring.mail.username}")
    String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Hue Travel Map");
            helper.setTo(toEmail);
            helper.setSubject("Mã xác thực đổi mật khẩu - Hue Travel Map");
            
            // THIẾT KẾ GIAO DIỆN HTML CHO EMAIL
            String htmlContent = 
                "<div style=\"font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2\">" +
                    "<div style=\"margin: 50px auto; width: 70%; padding: 20px 0\">" +
                        "<div style=\"border-bottom: 1px solid #eee\">" +
                            "<a href=\"\" style=\"font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600\">Hue Travel Map</a>" +
                        "</div>" +
                        "<p style=\"font-size: 1.1em\">Xin chào,</p>" +
                        "<p>Cảm ơn bạn đã sử dụng Hue Travel Map. Vui lòng sử dụng mã OTP dưới đây để hoàn tất thủ tục đặt lại mật khẩu của bạn. Mã này có hiệu lực trong <b>5 phút</b>.</p>" +
                        "<h2 style=\"background: #00466a; margin: 0 auto; width: max-content; padding: 0 20px; color: #fff; border-radius: 4px; letter-spacing: 5px;\">" + 
                            otpCode + 
                        "</h2>" +
                        "<p style=\"font-size: 0.9em;\">Vui lòng không chia sẻ mã này cho bất kỳ ai để bảo vệ tài khoản của bạn.</p>" +
                        "<hr style=\"border: none; border-top: 1px solid #eee\" />" +
                        "<div style=\"float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300\">" +
                            "<p>Đội ngũ Hue Travel Map</p>" +
                            "<p>Thành phố Huế, Việt Nam</p>" +
                        "</div>" +
                    "</div>" +
                "</div>";
            
            // TRUYỀN THAM SỐ 'true' ĐỂ BẬT CHẾ ĐỘ HTML
            helper.setText(htmlContent, true);
            
            mailSender.send(message);

        } catch (jakarta.mail.MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi khi tạo email gửi mã OTP: " + e.getMessage());
        }
    }
}