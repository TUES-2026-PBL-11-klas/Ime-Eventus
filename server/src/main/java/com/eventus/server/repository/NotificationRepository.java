package com.eventus.server.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientId(UUID recipientId);

    List<Notification> findByRecipientIdAndReadAtIsNull(UUID recipientId);

    List<Notification> findByRecipientIdAndReadAtIsNotNull(UUID recipientId);

    int countByRecipientIdAndReadAtIsNull(UUID recipientId);
}
