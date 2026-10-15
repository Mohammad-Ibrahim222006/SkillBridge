package com.skillbridge.service;

import com.skillbridge.dto.request.ProjectRequest;
import com.skillbridge.dto.request.ProjectSkillRequirementRequest;
import com.skillbridge.dto.response.*;
import com.skillbridge.entity.*;
import com.skillbridge.entity.enums.MembershipRole;
import com.skillbridge.entity.enums.ProjectDifficulty;
import com.skillbridge.entity.enums.ProjectStatus;
import com.skillbridge.entity.enums.TaskStatus;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectSkillRequirementRepository requirementRepository;
    private final TeamMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SkillService skillService;
    private final SkillMatchService skillMatchService;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectSkillRequirementRepository requirementRepository,
            TeamMembershipRepository membershipRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            SkillRepository skillRepository,
            SkillService skillService,
            SkillMatchService skillMatchService) {
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.membershipRepository = membershipRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.skillService = skillService;
        this.skillMatchService = skillMatchService;
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> searchProjects(
            String query,
            ProjectStatus status,
            ProjectDifficulty difficulty,
            String category,
            Pageable pageable,
            Long currentUserId) {

        String trimmedQuery = StringUtils.hasText(query) ? query.trim() : null;
        String trimmedCategory = StringUtils.hasText(category) && !"ALL".equalsIgnoreCase(category) ? category.trim() : null;

        Page<Project> projectsPage = projectRepository.searchProjects(trimmedQuery, status, difficulty, trimmedCategory, pageable);

        List<ProjectResponse> dtos = projectsPage.getContent().stream().map(project -> {
            ProjectResponse resp = mapToProjectResponse(project);
            if (currentUserId != null) {
                try {
                    SkillMatchResultResponse match = skillMatchService.calculateMatch(project.getId(), currentUserId);
                    resp.setUserMatchScore(match.getCoveragePercentage());
                } catch (Exception ignored) {}
            }
            return resp;
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, projectsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectDetails(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        ProjectDetailResponse detail = new ProjectDetailResponse();
        populateBaseProjectFields(project, detail);

        // Members
        List<TeamMemberResponse> members = membershipRepository.findByProjectIdWithUser(projectId)
                .stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());
        detail.setMembers(members);
        detail.setCurrentMembersCount(members.size());

        // Tasks
        List<TaskResponse> tasks = taskRepository.findByProjectIdWithUsers(projectId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
        detail.setTasks(tasks);

        // Progress
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        double progress = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;
        detail.setTaskCompletionPercentage(Math.round(progress * 10.0) / 10.0);

        // Current User Context
        if (currentUserId != null) {
            boolean isOwner = project.getOwner().getId().equals(currentUserId);
            detail.setCurrentUserOwner(isOwner);

            Optional<TeamMembership> userMembership = membershipRepository.findByProjectIdAndUserId(projectId, currentUserId);
            if (userMembership.isPresent()) {
                detail.setCurrentUserMember(true);
                detail.setCurrentUserRole(userMembership.get().getRole().name());
            } else if (isOwner) {
                detail.setCurrentUserMember(true);
                detail.setCurrentUserRole(MembershipRole.OWNER.name());
            } else {
                detail.setCurrentUserMember(false);
                detail.setCurrentUserRole(null);
            }

            try {
                SkillMatchResultResponse match = skillMatchService.calculateMatch(projectId, currentUserId);
                detail.setUserMatchScore(match.getCoveragePercentage());
            } catch (Exception ignored) {}
        }

        return detail;
    }

    @Transactional
    public ProjectDetailResponse createProject(Long userId, ProjectRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Project project = new Project();
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription().trim());
        project.setOwner(owner);
        project.setCategory(StringUtils.hasText(request.getCategory()) ? request.getCategory().trim() : "General");
        project.setDifficulty(request.getDifficulty());
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.OPEN);
        project.setTeamCapacity(request.getTeamCapacity());
        project.setDeadline(request.getDeadline());
        project.setGithubRepoUrl(request.getGithubRepoUrl());
        project.setDemoUrl(request.getDemoUrl());

        Project savedProject = projectRepository.save(project);

        // Save skill requirements
        if (request.getSkillRequirements() != null) {
            for (ProjectSkillRequirementRequest reqDto : request.getSkillRequirements()) {
                Skill skill;
                if (reqDto.getSkillId() != null) {
                    skill = skillRepository.findById(reqDto.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + reqDto.getSkillId()));
                } else if (StringUtils.hasText(reqDto.getSkillName())) {
                    skill = skillService.findOrCreateSkill(reqDto.getSkillName(), reqDto.getCategory());
                } else {
                    continue;
                }

                ProjectSkillRequirement requirement = new ProjectSkillRequirement(
                        savedProject,
                        skill,
                        reqDto.getRequiredProficiency(),
                        reqDto.getWeight()
                );
                requirementRepository.save(requirement);
            }
        }

        // Add creator as OWNER in TeamMembership
        TeamMembership ownerMembership = new TeamMembership(savedProject, owner, MembershipRole.OWNER);
        membershipRepository.save(ownerMembership);

        return getProjectDetails(savedProject.getId(), userId);
    }

    @Transactional
    public ProjectDetailResponse updateProject(Long projectId, Long userId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the project owner can edit this project");
        }

        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription().trim());
        if (StringUtils.hasText(request.getCategory())) {
            project.setCategory(request.getCategory().trim());
        }
        if (request.getDifficulty() != null) {
            project.setDifficulty(request.getDifficulty());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getTeamCapacity() != null) {
            project.setTeamCapacity(request.getTeamCapacity());
        }
        project.setDeadline(request.getDeadline());
        project.setGithubRepoUrl(request.getGithubRepoUrl());
        project.setDemoUrl(request.getDemoUrl());

        projectRepository.save(project);

        // Update skill requirements
        if (request.getSkillRequirements() != null) {
            requirementRepository.deleteByProjectId(projectId);
            for (ProjectSkillRequirementRequest reqDto : request.getSkillRequirements()) {
                Skill skill;
                if (reqDto.getSkillId() != null) {
                    skill = skillRepository.findById(reqDto.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + reqDto.getSkillId()));
                } else if (StringUtils.hasText(reqDto.getSkillName())) {
                    skill = skillService.findOrCreateSkill(reqDto.getSkillName(), reqDto.getCategory());
                } else {
                    continue;
                }

                ProjectSkillRequirement requirement = new ProjectSkillRequirement(
                        project,
                        skill,
                        reqDto.getRequiredProficiency(),
                        reqDto.getWeight()
                );
                requirementRepository.save(requirement);
            }
        }

        return getProjectDetails(projectId, userId);
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the project owner can delete this project");
        }

        projectRepository.delete(project);
    }

    public ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse resp = new ProjectResponse();
        populateBaseProjectFields(project, resp);
        return resp;
    }

    private void populateBaseProjectFields(Project project, ProjectResponse resp) {
        resp.setId(project.getId());
        resp.setTitle(project.getTitle());
        resp.setDescription(project.getDescription());
        resp.setOwnerId(project.getOwner().getId());
        resp.setOwnerName(project.getOwner().getFullName());
        resp.setOwnerEmail(project.getOwner().getEmail());
        resp.setCategory(project.getCategory());
        resp.setDifficulty(project.getDifficulty());
        resp.setStatus(project.getStatus());
        resp.setTeamCapacity(project.getTeamCapacity());
        resp.setCurrentMembersCount((int) membershipRepository.countByProjectId(project.getId()));
        resp.setDeadline(project.getDeadline());
        resp.setGithubRepoUrl(project.getGithubRepoUrl());
        resp.setDemoUrl(project.getDemoUrl());
        resp.setCreatedAt(project.getCreatedAt());

        List<ProjectSkillRequirementResponse> reqs = requirementRepository.findByProjectIdWithSkill(project.getId())
                .stream()
                .map(this::mapToRequirementResponse)
                .collect(Collectors.toList());
        resp.setSkillRequirements(reqs);
    }

    public ProjectSkillRequirementResponse mapToRequirementResponse(ProjectSkillRequirement req) {
        ProjectSkillRequirementResponse resp = new ProjectSkillRequirementResponse();
        resp.setId(req.getId());
        resp.setSkillId(req.getSkill().getId());
        resp.setSkillName(req.getSkill().getName());
        resp.setCategory(req.getSkill().getCategory());
        resp.setRequiredProficiency(req.getRequiredProficiency());
        resp.setWeight(req.getWeight());
        return resp;
    }

    public TeamMemberResponse mapToTeamMemberResponse(TeamMembership tm) {
        TeamMemberResponse resp = new TeamMemberResponse();
        resp.setId(tm.getId());
        resp.setUserId(tm.getUser().getId());
        resp.setFullName(tm.getUser().getFullName());
        resp.setEmail(tm.getUser().getEmail());
        resp.setBio(tm.getUser().getBio());
        resp.setEducation(tm.getUser().getEducation());
        resp.setGithubUrl(tm.getUser().getGithubUrl());
        resp.setLinkedinUrl(tm.getUser().getLinkedinUrl());
        resp.setRole(tm.getRole());
        resp.setJoinedAt(tm.getJoinedAt());
        return resp;
    }

    public TaskResponse mapToTaskResponse(Task task) {
        TaskResponse resp = new TaskResponse();
        resp.setId(task.getId());
        resp.setProjectId(task.getProject().getId());
        resp.setProjectTitle(task.getProject().getTitle());
        resp.setTitle(task.getTitle());
        resp.setDescription(task.getDescription());
        if (task.getAssignee() != null) {
            resp.setAssigneeId(task.getAssignee().getId());
            resp.setAssigneeName(task.getAssignee().getFullName());
            resp.setAssigneeEmail(task.getAssignee().getEmail());
        }
        resp.setCreatorId(task.getCreator().getId());
        resp.setCreatorName(task.getCreator().getFullName());
        resp.setStatus(task.getStatus());
        resp.setPriority(task.getPriority());
        resp.setDueDate(task.getDueDate());
        resp.setCreatedAt(task.getCreatedAt());
        resp.setUpdatedAt(task.getUpdatedAt());
        return resp;
    }
}
