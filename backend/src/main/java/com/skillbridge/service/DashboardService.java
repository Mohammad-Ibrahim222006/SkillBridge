package com.skillbridge.service;

import com.skillbridge.dto.response.*;
import com.skillbridge.entity.enums.GoalStatus;
import com.skillbridge.entity.enums.InvitationStatus;
import com.skillbridge.entity.enums.ProjectStatus;
import com.skillbridge.entity.enums.TaskStatus;
import com.skillbridge.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProfileService profileService;
    private final UserSkillRepository userSkillRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final ProjectRepository projectRepository;
    private final TeamMembershipRepository membershipRepository;
    private final ProjectInvitationRepository invitationRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final ProjectService projectService;
    private final SkillMatchService skillMatchService;
    private final LearningGoalService learningGoalService;

    public DashboardService(
            ProfileService profileService,
            UserSkillRepository userSkillRepository,
            LearningGoalRepository learningGoalRepository,
            ProjectRepository projectRepository,
            TeamMembershipRepository membershipRepository,
            ProjectInvitationRepository invitationRepository,
            TaskRepository taskRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService,
            ProjectService projectService,
            SkillMatchService skillMatchService,
            LearningGoalService learningGoalService) {
        this.profileService = profileService;
        this.userSkillRepository = userSkillRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.invitationRepository = invitationRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.projectService = projectService;
        this.skillMatchService = skillMatchService;
        this.learningGoalService = learningGoalService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        UserProfileResponse profile = profileService.getCurrentUserProfile(userId);

        long totalSkills = userSkillRepository.findByUserId(userId).size();
        long activeGoals = learningGoalRepository.countByUserIdAndStatus(userId, GoalStatus.IN_PROGRESS) +
                           learningGoalRepository.countByUserIdAndStatus(userId, GoalStatus.NOT_STARTED);
        long completedGoals = learningGoalRepository.countByUserIdAndStatus(userId, GoalStatus.COMPLETED);

        long createdProjects = projectRepository.countByOwnerId(userId);
        long joinedProjects = membershipRepository.countByUserId(userId);
        long pendingInvitations = invitationRepository.countByInviteeIdAndStatus(userId, InvitationStatus.PENDING);

        long assignedTasks = taskRepository.countByAssigneeId(userId);
        long completedTasks = taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.COMPLETED);
        double taskRate = assignedTasks > 0 ? ((double) completedTasks / assignedTasks) * 100.0 : 0.0;

        List<NotificationResponse> recentNotifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 5))
                .stream()
                .map(notificationService::mapToNotificationResponse)
                .collect(Collectors.toList());

        List<ProjectResponse> allOpenProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.OPEN)
                .map(projectService::mapToProjectResponse)
                .peek(p -> {
                    try {
                        SkillMatchResultResponse match = skillMatchService.calculateMatch(p.getId(), userId);
                        p.setUserMatchScore(match.getCoveragePercentage());
                    } catch (Exception e) {
                        p.setUserMatchScore(0.0);
                    }
                })
                .sorted(Comparator.comparing(ProjectResponse::getUserMatchScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(4)
                .collect(Collectors.toList());

        List<TaskResponse> urgentTasks = taskRepository.findByAssigneeIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .limit(5)
                .map(projectService::mapToTaskResponse)
                .collect(Collectors.toList());

        List<LearningGoalResponse> activeGoalsList = learningGoalService.getUserGoals(userId)
                .stream()
                .filter(g -> g.getStatus() != GoalStatus.COMPLETED)
                .limit(4)
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse();
        response.setProfile(profile);
        response.setProfileCompleteness(profile.getCompletenessPercentage());
        response.setTotalSkills(totalSkills);
        response.setActiveGoals(activeGoals);
        response.setCompletedGoals(completedGoals);
        response.setCreatedProjects(createdProjects);
        response.setJoinedProjects(joinedProjects);
        response.setPendingInvitations(pendingInvitations);
        response.setAssignedTasks(assignedTasks);
        response.setCompletedTasks(completedTasks);
        response.setOverallTaskCompletionRate(Math.round(taskRate * 10.0) / 10.0);
        response.setRecentNotifications(recentNotifications);
        response.setRecommendedProjects(allOpenProjects);
        response.setUrgentTasks(urgentTasks);
        response.setActiveGoalsList(activeGoalsList);

        return response;
    }
}
