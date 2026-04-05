package com.eventus.server.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.auth.AuthResponse;
import com.eventus.server.dto.auth.LoginRequest;
import com.eventus.server.dto.auth.RegisterRequest;
import com.eventus.server.entity.ERole;
import com.eventus.server.entity.Role;
import com.eventus.server.entity.User;
import com.eventus.server.exception.ResourceAlreadyExistsException;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.RoleRepository;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.security.JwtTokenProvider;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("User", "email", request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setActive(true);

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role studentRole = roleRepository.findByCode(ERole.STUDENT)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "code", "STUDENT"));
            roles.add(studentRole);
        } else {
            for (String roleName : request.getRoles()) {
                ERole eRole = ERole.valueOf(roleName);
                Role role = roleRepository.findByCode(eRole)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "code", roleName));
                roles.add(role);
            }
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtTokenProvider.generateToken(authentication);

        List<String> roleNames = savedUser.getRoles().stream()
                .map(r -> r.getCode().name())
                .toList();

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(),
                savedUser.getFullName(), roleNames);
    }
}
