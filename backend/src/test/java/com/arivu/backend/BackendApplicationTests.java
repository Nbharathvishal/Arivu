package com.arivu.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.arivu.backend.security.JwtUtils;
import com.arivu.backend.security.UserDetailsImpl;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    void contextLoads() {
    }

    @Test
    void testJwtTokenGenerationAndValidation() {
        UserDetailsImpl principal = new UserDetailsImpl("test-id", "test-user", "test@example.com", "test-password", List.of());
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of());

        String token = jwtUtils.generateJwtToken(authentication);
        assertTrue(jwtUtils.validateJwtToken(token));

        String username = jwtUtils.getUserNameFromJwtToken(token);
        assertEquals("test@example.com", username);
    }
}
