package org.example.courzelo.models;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;

@NoArgsConstructor
@Data
@Document(collection = "users")
public class User implements UserDetails {
    @Id
    private String id;
    @NotNull
    @Indexed(unique = true)
    private String email;
    @NotNull
    private String password;
    @NotNull
    private List<Role> roles = new ArrayList<>();
    private UserSecurity security = new UserSecurity();
    private UserActivity activity = new UserActivity();
    private UserProfile profile = new UserProfile();
    private UserEducation education = new UserEducation();

    public User(String email, String name, String lastname, Date birthDate, String gender, String country, String encode, Role role) {
        this.email = email;
        this.profile.setName(name);
        this.profile.setLastname(lastname);
        this.profile.setBirthDate(birthDate);
        this.profile.setGender(gender);
        this.profile.setCountry(country);
        this.password = encode;
        this.roles.add(role);
    }
    public User(String email, String name, String lastname, Date birthDate, String gender, String country, String encode) {
        this.email = email;
        this.profile.setName(name);
        this.profile.setLastname(lastname);
        this.profile.setBirthDate(birthDate);
        this.profile.setGender(gender);
        this.profile.setCountry(country);
        this.password = encode;
        this.roles = new ArrayList<>();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .filter(Objects::nonNull)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !security.getBan();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return security.isEnabled();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        User user = (User) o;
        return Objects.equals(id, user.id) &&
                Objects.equals(email, user.email);
    }
}
