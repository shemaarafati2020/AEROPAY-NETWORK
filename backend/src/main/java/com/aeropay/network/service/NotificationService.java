package com.aeropay.network.service;

import com.aeropay.network.dto.BroadcastNotificationRequest;
import com.aeropay.network.dto.NotificationDto;
import com.aeropay.network.exception.ResourceNotFoundException;
import com.aeropay.network.model.Notification;
import com.aeropay.network.model.NotificationType;
import com.aeropay.network.model.User;
import com.aeropay.network.repository.NotificationRepository;
import com.aeropay.network.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(Long userId) {
        return notificationRepository.findUserAndGlobalNotifications(userId).stream()
                .map(this::mapToNotificationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not accessible");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findUserAndGlobalNotifications(userId);
        for (Notification n : unread) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public void sendDirectNotification(User user, String title, String message, NotificationType type) {
        Notification n = new Notification(user, title, message, type);
        notificationRepository.save(n);
    }

    @Transactional
    public long broadcastNotification(BroadcastNotificationRequest request) {
        if (request.getTargetUserId() != null) {
            User target = userRepository.findById(request.getTargetUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));
            Notification n = new Notification(target, request.getTitle(), request.getMessage(), request.getType());
            n.setActionUrl(request.getActionUrl());
            notificationRepository.save(n);
            return 1;
        }

        if (request.getTargetRole() != null) {
            List<User> targetUsers = userRepository.findAllByRole(request.getTargetRole());
            for (User u : targetUsers) {
                Notification n = new Notification(u, request.getTitle(), request.getMessage(), request.getType());
                n.setActionUrl(request.getActionUrl());
                notificationRepository.save(n);
            }
            return targetUsers.size();
        }

        // Global broadcast (user is null)
        Notification global = new Notification(null, request.getTitle(), request.getMessage(), request.getType());
        global.setActionUrl(request.getActionUrl());
        notificationRepository.save(global);
        return userRepository.count();
    }

    public NotificationDto mapToNotificationDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        dto.setActionUrl(n.getActionUrl());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
