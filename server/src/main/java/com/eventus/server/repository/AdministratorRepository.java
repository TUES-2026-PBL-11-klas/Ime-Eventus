package com.eventus.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Administrator;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
}
