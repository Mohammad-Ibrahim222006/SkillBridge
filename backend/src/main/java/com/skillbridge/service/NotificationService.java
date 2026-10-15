package com.skillbridge.service;

import com.skillbridge.dto.response.NotificationResponse;
import com.skillbridge.entity.Notification;
import com.skillbridge.entity.User;
import com.skillbridge.entity.enums.NotificationType;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotificationsPage(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToNotificationResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ForbiddenException("You cannot view or update another student's notifications");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByRecipientId(userId);
    }

    @Transactional
    public Notification createNotification(User recipient, NotificationType type, String title, String message, String linkUrl) {
        Notification notification = new Notification(recipient, type, title, message, linkUrl);
        return notificationRepository.save(notification);
    }

    public NotificationResponse mapToNotificationResponse(Notification notif) {
        NotificationResponse resp = new NotificationResponse();
        resp.setId(notif.getId());
        resp.setType(notif.getType());
        resp.setTitle(notif.getTitle());
        resp.setMessage(notif.getMessage());
        resp.setRead(notif.isRead());
        resp.setLinkUrl(notif.getLinkUrl());
        resp.setCreatedAt(notif.getCreatedAt());
        return resp;
    }
}
