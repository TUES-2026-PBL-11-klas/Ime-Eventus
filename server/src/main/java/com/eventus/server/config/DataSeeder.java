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
        for (ERole eRole : ERole.values()) {
            if (!roleRepository.existsByName(eRole)) {
                Role role = new Role();
                role.setName(eRole);
                roleRepository.save(role);
                log.info("Seeded role: {}", eRole.name());
            }
        }
        log.info("Role seeding complete. Total roles: {}", roleRepository.count());
    }
}
