package com.eventus.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientId(Long recipientId);

    List<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead);

    int countByRecipientIdAndIsRead(Long recipientId, boolean isRead);
}
