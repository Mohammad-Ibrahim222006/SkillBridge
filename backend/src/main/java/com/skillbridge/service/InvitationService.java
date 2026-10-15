package com.skillbridge.service;

import com.skillbridge.dto.request.InvitationRequest;
import com.skillbridge.dto.response.InvitationResponse;
import com.skillbridge.entity.*;
import com.skillbridge.entity.enums.InvitationStatus;
import com.skillbridge.entity.enums.MembershipRole;
import com.skillbridge.entity.enums.NotificationType;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ConflictException;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvitationService {

    private final ProjectInvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final TeamMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InvitationService(
            ProjectInvitationRepository invitationRepository,
            ProjectRepository projectRepository,
            TeamMembershipRepository membershipRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.invitationRepository = invitationRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public InvitationResponse sendInvitation(Long projectId, Long inviterId, InvitationRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getOwner().getId().equals(inviterId)) {
            throw new ForbiddenException("Only the project owner can invite teammates to this project");
        }

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new ResourceNotFoundException("Inviter not found"));

        User invitee = userRepository.findById(request.getInviteeId())
                .orElseThrow(() -> new ResourceNotFoundException("User to invite not found with ID: " + request.getInviteeId()));

        if (inviterId.equals(invitee.getId())) {
            throw new BadRequestException("You cannot invite yourself to your own project");
        }

        // Check if already a member
        if (membershipRepository.existsByProjectIdAndUserId(projectId, invitee.getId())) {
            throw new ConflictException("User is already a member of this project");
        }

        // Check team capacity
        long currentMembers = membershipRepository.countByProjectId(projectId);
        if (currentMembers >= project.getTeamCapacity()) {
            throw new BadRequestException("Project team has reached its maximum capacity of " + project.getTeamCapacity() + " members");
        }

        // Check for existing pending invitation
        if (invitationRepository.existsByProjectIdAndInviteeIdAndStatus(projectId, invitee.getId(), InvitationStatus.PENDING)) {
            throw new ConflictException("A pending invitation has already been sent to this student");
        }

        ProjectInvitation invitation = new ProjectInvitation(
                project,
                inviter,
                invitee,
                request.getMessage(),
                request.getRole() != null ? request.getRole() : MembershipRole.MEMBER
        );

        ProjectInvitation saved = invitationRepository.save(invitation);

        // Notify invitee
        notificationService.createNotification(
                invitee,
                NotificationType.INVITATION_RECEIVED,
                "New Project Invitation",
                inviter.getFullName() + " invited you to join '" + project.getTitle() + "'.",
                "/invitations"
        );

        return mapToInvitationResponse(saved);
    }

    @Transactional
    public InvitationResponse respondToInvitation(Long invitationId, Long inviteeId, boolean accept) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));

        if (!invitation.getInvitee().getId().equals(inviteeId)) {
            throw new ForbiddenException("You are not authorized to respond to this invitation");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("This invitation has already been responded to (Current status: " + invitation.getStatus() + ")");
        }

        Project project = invitation.getProject();
        invitation.setRespondedAt(LocalDateTime.now());

        if (accept) {
            // Check capacity
            long currentMembers = membershipRepository.countByProjectId(project.getId());
            if (currentMembers >= project.getTeamCapacity()) {
                throw new BadRequestException("Cannot accept invitation: Project team has reached capacity (" + project.getTeamCapacity() + " members)");
            }

            // Create membership
            if (!membershipRepository.existsByProjectIdAndUserId(project.getId(), inviteeId)) {
                TeamMembership membership = new TeamMembership(project, invitation.getInvitee(), invitation.getRole());
                membershipRepository.save(membership);
            }

            invitation.setStatus(InvitationStatus.ACCEPTED);

            // Notify inviter
            notificationService.createNotification(
                    invitation.getInviter(),
                    NotificationType.INVITATION_ACCEPTED,
                    "Invitation Accepted",
                    invitation.getInvitee().getFullName() + " accepted your invitation to join '" + project.getTitle() + "'!",
                    "/projects/" + project.getId()
            );
        } else {
            invitation.setStatus(InvitationStatus.REJECTED);

            // Notify inviter
            notificationService.createNotification(
                    invitation.getInviter(),
                    NotificationType.INVITATION_REJECTED,
                    "Invitation Declined",
                    invitation.getInvitee().getFullName() + " declined the invitation to join '" + project.getTitle() + "'.",
                    "/projects/" + project.getId()
            );
        }

        ProjectInvitation saved = invitationRepository.save(invitation);
        return mapToInvitationResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getUserInvitations(Long userId) {
        return invitationRepository.findByInviteeIdWithDetails(userId)
                .stream()
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getProjectInvitations(Long projectId, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getOwner().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Only the project owner can view sent invitations");
        }

        return invitationRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }

    private InvitationResponse mapToInvitationResponse(ProjectInvitation inv) {
        InvitationResponse resp = new InvitationResponse();
        resp.setId(inv.getId());
        resp.setProjectId(inv.getProject().getId());
        resp.setProjectTitle(inv.getProject().getTitle());
        resp.setProjectCategory(inv.getProject().getCategory());
        resp.setInviterId(inv.getInviter().getId());
        resp.setInviterName(inv.getInviter().getFullName());
        resp.setInviteeId(inv.getInvitee().getId());
        resp.setInviteeName(inv.getInvitee().getFullName());
        resp.setMessage(inv.getMessage());
        resp.setRole(inv.getRole());
        resp.setStatus(inv.getStatus());
        resp.setCreatedAt(inv.getCreatedAt());
        resp.setRespondedAt(inv.getRespondedAt());
        return resp;
    }
}
