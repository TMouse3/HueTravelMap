package com.mouse3.hue_travel_map.entity;

import com.mouse3.hue_travel_map.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String fullName;

    @Column(name = "avatar_url", columnDefinition = "VARCHAR(MAX)")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Quan hệ 1 User - Nhiều Checkin
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Checkin> checkins;

    // Quan hệ 1 User - Nhiều Suggestion
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY,    cascade = CascadeType.ALL)
    private List<PlaceSuggestion> suggestions;
}