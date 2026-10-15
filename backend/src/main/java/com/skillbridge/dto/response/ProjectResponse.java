package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.ProjectDifficulty;
import com.skillbridge.entity.enums.ProjectStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String category;
    private ProjectDifficulty difficulty;
    private ProjectStatus status;
    private Integer teamCapacity;
    private int currentMembersCount;
    private LocalDate deadline;
    private String githubRepoUrl;
    private String demoUrl;
    private LocalDateTime createdAt;
    private List<ProjectSkillRequirementResponse> skillRequirements;
    private Double userMatchScore; // Populated dynamically when requested in student context

    public ProjectResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ProjectDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(ProjectDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Integer getTeamCapacity() {
        return teamCapacity;
    }

    public void setTeamCapacity(Integer teamCapacity) {
        this.teamCapacity = teamCapacity;
    }

    public int getCurrentMembersCount() {
        return currentMembersCount;
    }

    public void setCurrentMembersCount(int currentMembersCount) {
        this.currentMembersCount = currentMembersCount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getGithubRepoUrl() {
        return githubRepoUrl;
    }

    public void setGithubRepoUrl(String githubRepoUrl) {
        this.githubRepoUrl = githubRepoUrl;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ProjectSkillRequirementResponse> getSkillRequirements() {
        return skillRequirements;
    }

    public void setSkillRequirements(List<ProjectSkillRequirementResponse> skillRequirements) {
        this.skillRequirements = skillRequirements;
    }

    public Double getUserMatchScore() {
        return userMatchScore;
    }

    public void setUserMatchScore(Double userMatchScore) {
        this.userMatchScore = userMatchScore;
    }
}
