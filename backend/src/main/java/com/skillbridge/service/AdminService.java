package com.skillbridge.service;

import com.skillbridge.dto.response.AdminStatsResponse;
import com.skillbridge.dto.response.UserSummaryResponse;
import com.skillbridge.entity.Project;
import com.skillbridge.entity.User;
import com.skillbridge.entity.enums.ProjectStatus;
import com.skillbridge.entity.enums.Role;
import com.skillbridge.entity.enums.TaskStatus;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final TaskRepository taskRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final ProjectInvitationRepository invitationRepository;

    public AdminService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            TaskRepository taskRepository,
            LearningGoalRepository learningGoalRepository,
            ProjectInvitationRepository invitationRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.taskRepository = taskRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.invitationRepository = invitationRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getPlatformStats() {
        AdminStatsResponse stats = new AdminStatsResponse();
        List<User> users = userRepository.findAll();
        List<Project> projects = projectRepository.findAll();

        stats.setTotalUsers(users.size());
        stats.setTotalStudents(users.stream().filter(u -> u.getRole() == Role.ROLE_STUDENT).count());
        stats.setTotalAdmins(users.stream().filter(u -> u.getRole() == Role.ROLE_ADMIN).count());

        stats.setTotalProjects(projects.size());
        stats.setOpenProjects(projects.stream().filter(p -> p.getStatus() == ProjectStatus.OPEN).count());
        stats.setInProgressProjects(projects.stream().filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count());
        stats.setCompletedProjects(projects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count());

        stats.setTotalSkills(skillRepository.count());
        stats.setTotalUserSkills(userSkillRepository.count());
        stats.setTotalTasks(taskRepository.count());
        stats.setCompletedTasks(taskRepository.findAll().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count());
        stats.setTotalGoals(learningGoalRepository.count());
        stats.setTotalInvitations(invitationRepository.count());

        return stats;
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getAllUsers(String query, Pageable pageable) {
        Page<User> users;
        if (StringUtils.hasText(query)) {
            users = userRepository.searchUsers(query.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToUserSummaryResponse);
    }

    @Transactional
    public UserSummaryResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return mapToUserSummaryResponse(saved);
    }

    @Transactional
    public UserSummaryResponse changeUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setRole(newRole);
        User saved = userRepository.save(user);
        return mapToUserSummaryResponse(saved);
    }

    @Transactional
    public void moderateProject(Long projectId, ProjectStatus status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        project.setStatus(status);
        projectRepository.save(project);
    }

    private UserSummaryResponse mapToUserSummaryResponse(User user) {
        UserSummaryResponse resp = new UserSummaryResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setBio(user.getBio());
        resp.setEducation(user.getEducation());
        resp.setInterests(user.getInterests());
        resp.setGithubUrl(user.getGithubUrl());
        resp.setLinkedinUrl(user.getLinkedinUrl());
        resp.setPortfolioUrl(user.getPortfolioUrl());
        resp.setRole(user.getRole());
        resp.setActive(user.isActive());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }
}
