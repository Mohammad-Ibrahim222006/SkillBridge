package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.Role;
import java.time.LocalDateTime;
import java.util.List;

public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String bio;
    private String education;
    private String interests;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    private int completenessPercentage;
    private long skillsCount;
    private long goalsCount;
    private long projectsCreatedCount;
    private long projectsJoinedCount;
    private long pendingInvitationsCount;
    private long assignedTasksCount;
    private List<UserSkillResponse> skills;
    private List<LearningGoalResponse> activeGoals;

    public UserProfileResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getCompletenessPercentage() {
        return completenessPercentage;
    }

    public void setCompletenessPercentage(int completenessPercentage) {
        this.completenessPercentage = completenessPercentage;
    }

    public long getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(long skillsCount) {
        this.skillsCount = skillsCount;
    }

    public long getGoalsCount() {
        return goalsCount;
    }

    public void setGoalsCount(long goalsCount) {
        this.goalsCount = goalsCount;
    }

    public long getProjectsCreatedCount() {
        return projectsCreatedCount;
    }

    public void setProjectsCreatedCount(long projectsCreatedCount) {
        this.projectsCreatedCount = projectsCreatedCount;
    }

    public long getProjectsJoinedCount() {
        return projectsJoinedCount;
    }

    public void setProjectsJoinedCount(long projectsJoinedCount) {
        this.projectsJoinedCount = projectsJoinedCount;
    }

    public long getPendingInvitationsCount() {
        return pendingInvitationsCount;
    }

    public void setPendingInvitationsCount(long pendingInvitationsCount) {
        this.pendingInvitationsCount = pendingInvitationsCount;
    }

    public long getAssignedTasksCount() {
        return assignedTasksCount;
    }

    public void setAssignedTasksCount(long assignedTasksCount) {
        this.assignedTasksCount = assignedTasksCount;
    }

    public List<UserSkillResponse> getSkills() {
        return skills;
    }

    public void setSkills(List<UserSkillResponse> skills) {
        this.skills = skills;
    }

    public List<LearningGoalResponse> getActiveGoals() {
        return activeGoals;
    }

    public void setActiveGoals(List<LearningGoalResponse> activeGoals) {
        this.activeGoals = activeGoals;
    }
}
