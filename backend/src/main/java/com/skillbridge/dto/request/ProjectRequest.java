package com.skillbridge.dto.request;

import com.skillbridge.entity.enums.ProjectDifficulty;
import com.skillbridge.entity.enums.ProjectStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String category = "General";

    @NotNull(message = "Difficulty level is required")
    private ProjectDifficulty difficulty = ProjectDifficulty.INTERMEDIATE;

    private ProjectStatus status = ProjectStatus.OPEN;

    @NotNull(message = "Team capacity is required")
    @Min(value = 1, message = "Team capacity must be at least 1")
    @Max(value = 50, message = "Team capacity cannot exceed 50")
    private Integer teamCapacity = 4;

    private LocalDate deadline;
    private String githubRepoUrl;
    private String demoUrl;

    private List<ProjectSkillRequirementRequest> skillRequirements = new ArrayList<>();

    public ProjectRequest() {}

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

    public List<ProjectSkillRequirementRequest> getSkillRequirements() {
        return skillRequirements;
    }

    public void setSkillRequirements(List<ProjectSkillRequirementRequest> skillRequirements) {
        this.skillRequirements = skillRequirements;
    }
}
