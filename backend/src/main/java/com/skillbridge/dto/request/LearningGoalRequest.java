package com.skillbridge.dto.request;

import com.skillbridge.entity.enums.GoalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class LearningGoalRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private Long targetSkillId;
    private String targetSkillName;
    private LocalDate targetDate;
    private GoalStatus status;

    @Min(value = 0, message = "Progress percentage cannot be less than 0")
    @Max(value = 100, message = "Progress percentage cannot exceed 100")
    private Integer progressPercentage;

    public LearningGoalRequest() {}

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

    public Long getTargetSkillId() {
        return targetSkillId;
    }

    public void setTargetSkillId(Long targetSkillId) {
        this.targetSkillId = targetSkillId;
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public void setTargetSkillName(String targetSkillName) {
        this.targetSkillName = targetSkillName;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
