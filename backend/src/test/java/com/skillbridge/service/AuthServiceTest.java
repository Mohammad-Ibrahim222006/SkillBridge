package com.skillbridge.service;

import com.skillbridge.dto.request.LoginRequest;
import com.skillbridge.dto.request.RegisterRequest;
import com.skillbridge.dto.response.AuthResponse;
import com.skillbridge.entity.User;
import com.skillbridge.entity.enums.Role;
import com.skillbridge.exception.ConflictException;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.security.JwtUtils;
import com.skillbridge.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    private JwtUtils jwtUtils;

    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils("SkillBridgeTestSecretKeyMustBeAtLeast32BytesLongForHS256Security123456!", 86400000L);
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtUtils, null);

        sampleUser = new User("Jane Doe", "jane@example.com", "encodedPassword", Role.ROLE_STUDENT);
        sampleUser.setId(5L);
        sampleUser.setActive(true);
    }

    @Test
    @DisplayName("Should successfully register a new student and issue JWT token")
    void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "SecurePass123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(jwtUtils.validateJwtToken(response.getToken()));
        assertEquals("jane@example.com", response.getEmail());
        assertEquals(Role.ROLE_STUDENT, response.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration when email is already registered")
    void testDuplicateEmailRegistration() {
        RegisterRequest request = new RegisterRequest("Duplicate User", "jane@example.com", "SecurePass123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully authenticate valid credentials and return JWT token")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest("jane@example.com", "SecurePass123");
        UserPrincipal principal = UserPrincipal.create(sampleUser);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(jwtUtils.validateJwtToken(response.getToken()));
        assertEquals(5L, response.getId());
    }
}
