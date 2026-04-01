package com.eventus.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.eventus.server.entity.ERole;
import com.eventus.server.entity.Role;
import com.eventus.server.repository.RoleRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roleRepository;

    public DataSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        seedRole(ERole.STUDENT,     "Student");
        seedRole(ERole.TEACHER,     "Teacher");
        seedRole(ERole.COORDINATOR, "Coordinator");
        seedRole(ERole.ADMIN,       "Administrator");
        log.info("Role seeding complete. Total roles: {}", roleRepository.count());
    }

    private void seedRole(ERole code, String displayName) {
        if (!roleRepository.existsByCode(code)) {
            Role role = new Role(code, displayName);
            roleRepository.save(role);
            log.info("Seeded role: {} ({})", code.name(), displayName);
        }
    }
}
