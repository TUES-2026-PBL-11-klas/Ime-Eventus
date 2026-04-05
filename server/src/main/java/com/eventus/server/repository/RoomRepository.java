package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    List<Room> findByLocationDetailsContainingIgnoreCase(String locationDetails);

    Optional<Room> findByName(String name);

    List<Room> findByActiveTrue();
}
