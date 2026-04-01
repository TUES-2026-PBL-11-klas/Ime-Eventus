package com.eventus.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByBuilding(String building);

    Room findByName(String name);
}
