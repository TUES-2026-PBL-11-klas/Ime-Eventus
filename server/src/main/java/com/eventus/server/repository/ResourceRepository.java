package com.eventus.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Resource;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(String type);

    Resource findByName(String name);
}
