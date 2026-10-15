package com.skillbridge.service;

import com.skillbridge.dto.request.ProfileUpdateRequest;
import com.skillbridge.dto.request.UserSkillRequest;
import com.skillbridge.dto.response.LearningGoalResponse;
import com.skillbridge.dto.response.UserProfileResponse;
import com.skillbridge.dto.response.UserSkillResponse;
import com.skillbridge.entity.Skill;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.entity.enums.GoalStatus;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final ProjectRepository projectRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final ProjectInvitationRepository invitationRepository;
    private final TaskRepository taskRepository;
    private final SkillService skillService;

    public ProfileService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            SkillRepository skillRepository,
            LearningGoalRepository learningGoalRepository,
            ProjectRepository projectRepository,
            TeamMembershipRepository teamMembershipRepository,
            ProjectInvitationRepository invitationRepository,
            TaskRepository taskRepository,
            SkillService skillService) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.projectRepository = projectRepository;
        this.teamMembershipRepository = teamMembershipRepository;
        this.invitationRepository = invitationRepository;
        this.taskRepository = taskRepository;
        this.skillService = skillService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<UserSkillResponse> skills = getUserSkills(userId);
        List<LearningGoalResponse> activeGoals = learningGoalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(g -> g.getStatus() != GoalStatus.COMPLETED)
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());

        long goalsCount = learningGoalRepository.countByUserId(userId);
        long projectsCreated = projectRepository.countByOwnerId(userId);
        long projectsJoined = teamMembershipRepository.countByUserId(userId);
        long pendingInvitations = invitationRepository.countByInviteeIdAndStatus(userId, com.skillbridge.entity.enums.InvitationStatus.PENDING);
        long assignedTasks = taskRepository.countByAssigneeId(userId);

        int completeness = calculateCompleteness(user, skills.size(), goalsCount);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setEducation(user.getEducation());
        response.setInterests(user.getInterests());
        response.setGithubUrl(user.getGithubUrl());
        response.setLinkedinUrl(user.getLinkedinUrl());
        response.setPortfolioUrl(user.getPortfolioUrl());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setCompletenessPercentage(completeness);
        response.setSkillsCount(skills.size());
        response.setGoalsCount(goalsCount);
        response.setProjectsCreatedCount(projectsCreated);
        response.setProjectsJoinedCount(projectsJoined);
        response.setPendingInvitationsCount(pendingInvitations);
        response.setAssignedTasksCount(assignedTasks);
        response.setSkills(skills);
        response.setActiveGoals(activeGoals);

        return response;
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setFullName(request.getFullName().trim());
        user.setBio(request.getBio());
        user.setEducation(request.getEducation());
        user.setInterests(request.getInterests());
        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setPortfolioUrl(request.getPortfolioUrl());

        userRepository.save(user);
        return getCurrentUserProfile(userId);
    }

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getUserSkills(Long userId) {
        return userSkillRepository.findByUserIdWithSkill(userId)
                .stream()
                .map(this::mapToUserSkillResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSkillResponse addUserSkill(Long userId, UserSkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Skill skill;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + request.getSkillId()));
        } else if (StringUtils.hasText(request.getSkillName())) {
            skill = skillService.findOrCreateSkill(request.getSkillName(), request.getCategory());
        } else {
            throw new BadRequestException("Either skillId or skillName must be provided");
        }

        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(userId, skill.getId())
                .orElse(new UserSkill());

        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProficiency(request.getProficiency());
        userSkill.setYearsOfExperience(request.getYearsOfExperience() != null ? request.getYearsOfExperience() : 0.0);

        UserSkill saved = userSkillRepository.save(userSkill);
        return mapToUserSkillResponse(saved);
    }

    @Transactional
    public void deleteUserSkill(Long userId, Long skillId) {
        if (!userSkillRepository.existsByUserIdAndSkillId(userId, skillId)) {
            throw new ResourceNotFoundException("User does not have skill with ID: " + skillId);
        }
        userSkillRepository.deleteByUserIdAndSkillId(userId, skillId);
    }

    public int calculateCompleteness(User user, int skillsCount, long goalsCount) {
        int score = 0;
        if (StringUtils.hasText(user.getFullName())) score += 15;
        if (StringUtils.hasText(user.getBio())) score += 15;
        if (StringUtils.hasText(user.getEducation())) score += 15;
        if (StringUtils.hasText(user.getInterests())) score += 15;
        if (StringUtils.hasText(user.getGithubUrl()) || StringUtils.hasText(user.getLinkedinUrl()) || StringUtils.hasText(user.getPortfolioUrl())) {
            score += 15;
        }
        if (skillsCount > 0) score += 15;
        if (goalsCount > 0) score += 10;
        return Math.min(100, score);
    }

    public UserSkillResponse mapToUserSkillResponse(UserSkill us) {
        UserSkillResponse resp = new UserSkillResponse();
        resp.setId(us.getId());
        resp.setSkillId(us.getSkill().getId());
        resp.setSkillName(us.getSkill().getName());
        resp.setCategory(us.getSkill().getCategory());
        resp.setProficiency(us.getProficiency());
        resp.setYearsOfExperience(us.getYearsOfExperience());
        resp.setCreatedAt(us.getCreatedAt());
        return resp;
    }

    private LearningGoalResponse mapToGoalResponse(com.skillbridge.entity.LearningGoal goal) {
        LearningGoalResponse resp = new LearningGoalResponse();
        resp.setId(goal.getId());
        resp.setTitle(goal.getTitle());
        resp.setDescription(goal.getDescription());
        if (goal.getTargetSkill() != null) {
            resp.setTargetSkillId(goal.getTargetSkill().getId());
            resp.setTargetSkillName(goal.getTargetSkill().getName());
        } else {
            resp.setTargetSkillName(goal.getTargetSkillName());
        }
        resp.setTargetDate(goal.getTargetDate());
        resp.setStatus(goal.getStatus());
        resp.setProgressPercentage(goal.getProgressPercentage());
        resp.setCreatedAt(goal.getCreatedAt());
        resp.setUpdatedAt(goal.getUpdatedAt());
        return resp;
    }
}
