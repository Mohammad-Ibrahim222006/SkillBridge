package com.skillbridge.service;

import com.skillbridge.dto.response.TeamMemberResponse;
import com.skillbridge.dto.response.TeammateRecommendationResponse;
import com.skillbridge.dto.response.UserSkillResponse;
import com.skillbridge.entity.*;
import com.skillbridge.entity.enums.MembershipRole;
import com.skillbridge.entity.enums.NotificationType;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamMembershipRepository membershipRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSkillRequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final NotificationService notificationService;
    private final ProfileService profileService;

    public TeamService(
            TeamMembershipRepository membershipRepository,
            ProjectRepository projectRepository,
            ProjectSkillRequirementRepository requirementRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            NotificationService notificationService,
            ProfileService profileService) {
        this.membershipRepository = membershipRepository;
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.notificationService = notificationService;
        this.profileService = profileService;
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getProjectMembers(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        return membershipRepository.findByProjectIdWithUser(projectId)
                .stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeammateRecommendationResponse> recommendTeammates(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        List<ProjectSkillRequirement> requirements = requirementRepository.findByProjectIdWithSkill(projectId);
        List<TeamMembership> existingMembers = membershipRepository.findByProjectIdWithUser(projectId);

        Set<Long> existingMemberUserIds = existingMembers.stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());
        existingMemberUserIds.add(project.getOwner().getId());
        if (currentUserId != null) {
            existingMemberUserIds.add(currentUserId);
        }

        // What skills are already covered by current team members with sufficient proficiency?
        Set<Long> coveredSkillIds = new HashSet<>();
        for (TeamMembership member : existingMembers) {
            List<UserSkill> memberSkills = userSkillRepository.findByUserIdWithSkill(member.getUser().getId());
            for (UserSkill ms : memberSkills) {
                for (ProjectSkillRequirement req : requirements) {
                    if (req.getSkill().getId().equals(ms.getSkill().getId()) &&
                            ms.getProficiency().getLevel() >= req.getRequiredProficiency().getLevel()) {
                        coveredSkillIds.add(req.getSkill().getId());
                    }
                }
            }
        }

        // Identify missing or insufficient skills for the project team
        List<ProjectSkillRequirement> missingRequirements = requirements.stream()
                .filter(r -> !coveredSkillIds.contains(r.getSkill().getId()))
                .collect(Collectors.toList());

        // Find candidate active users who are not already on the team
        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> u.isActive() && !existingMemberUserIds.contains(u.getId()))
                .collect(Collectors.toList());

        List<TeammateRecommendationResponse> recommendations = new ArrayList<>();

        for (User candidate : candidates) {
            List<UserSkill> candidateSkills = userSkillRepository.findByUserIdWithSkill(candidate.getId());
            List<String> coveredMissing = new ArrayList<>();
            double complementaryScore = 0.0;

            for (ProjectSkillRequirement missingReq : (missingRequirements.isEmpty() ? requirements : missingRequirements)) {
                for (UserSkill cs : candidateSkills) {
                    if (cs.getSkill().getId().equals(missingReq.getSkill().getId())) {
                        int candidateLevel = cs.getProficiency().getLevel();
                        int reqLevel = missingReq.getRequiredProficiency().getLevel();

                        double matchRatio = Math.min(1.0, (double) candidateLevel / reqLevel);
                        double earned = missingReq.getWeight().getWeight() * matchRatio;
                        complementaryScore += earned;

                        coveredMissing.add(cs.getSkill().getName() + " (" + cs.getProficiency() + ")");
                    }
                }
            }

            if (!coveredMissing.isEmpty() || missingRequirements.isEmpty()) {
                TeammateRecommendationResponse rec = new TeammateRecommendationResponse();
                rec.setCandidateId(candidate.getId());
                rec.setFullName(candidate.getFullName());
                rec.setEmail(candidate.getEmail());
                rec.setBio(candidate.getBio());
                rec.setEducation(candidate.getEducation());
                rec.setInterests(candidate.getInterests());
                rec.setGithubUrl(candidate.getGithubUrl());
                rec.setLinkedinUrl(candidate.getLinkedinUrl());

                List<UserSkillResponse> skillResponses = candidateSkills.stream()
                        .map(profileService::mapToUserSkillResponse)
                        .collect(Collectors.toList());
                rec.setSkills(skillResponses);
                rec.setCoveredMissingSkills(coveredMissing);
                rec.setComplementaryScore(Math.round(complementaryScore * 10.0) / 10.0);

                if (!coveredMissing.isEmpty()) {
                    rec.setExplanation("Can cover team deficit in: " + String.join(", ", coveredMissing));
                } else {
                    rec.setExplanation("Available student ready to contribute to project development.");
                }

                recommendations.add(rec);
            }
        }

        // Sort by complementary score descending
        recommendations.sort((a, b) -> Double.compare(b.getComplementaryScore(), a.getComplementaryScore()));

        return recommendations;
    }

    @Transactional
    public void removeMember(Long projectId, Long memberUserId, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getOwner().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Only the project owner can remove team members");
        }

        if (project.getOwner().getId().equals(memberUserId)) {
            throw new BadRequestException("Cannot remove the project owner from the team");
        }

        TeamMembership membership = membershipRepository.findByProjectIdAndUserId(projectId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this project"));

        membershipRepository.delete(membership);

        User member = userRepository.findById(memberUserId).orElse(null);
        if (member != null) {
            notificationService.createNotification(
                    member,
                    NotificationType.TEAM_MEMBER_REMOVED,
                    "Removed from Project",
                    "You have been removed from the team for project '" + project.getTitle() + "'.",
                    "/projects/" + projectId
            );
        }
    }

    @Transactional
    public void leaveProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Project owner cannot leave the team. You may transfer ownership or delete the project.");
        }

        TeamMembership membership = membershipRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this project"));

        membershipRepository.delete(membership);

        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getFullName() : "A team member";

        notificationService.createNotification(
                project.getOwner(),
                NotificationType.TEAM_MEMBER_REMOVED,
                "Member Left Project",
                userName + " has left the team for '" + project.getTitle() + "'.",
                "/projects/" + projectId
        );
    }

    private TeamMemberResponse mapToTeamMemberResponse(TeamMembership tm) {
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
}
