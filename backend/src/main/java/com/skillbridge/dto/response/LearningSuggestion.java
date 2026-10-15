package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.ProficiencyLevel;

public class LearningSuggestion {
    private Long skillId;
    private String skillName;
    private ProficiencyLevel currentProficiency;
    private ProficiencyLevel targetProficiency;
    private String priority; // HIGH, MEDIUM, LOW
    private String reason;
    private String suggestedTitle;
    private String suggestedDescription;

    public LearningSuggestion() {}

    public LearningSuggestion(Long skillId, String skillName, ProficiencyLevel currentProficiency,
                              ProficiencyLevel targetProficiency, String priority, String reason,
                              String suggestedTitle, String suggestedDescription) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.currentProficiency = currentProficiency;
        this.targetProficiency = targetProficiency;
        this.priority = priority;
        this.reason = reason;
        this.suggestedTitle = suggestedTitle;
        this.suggestedDescription = suggestedDescription;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public ProficiencyLevel getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(ProficiencyLevel currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public ProficiencyLevel getTargetProficiency() {
        return targetProficiency;
    }

    public void setTargetProficiency(ProficiencyLevel targetProficiency) {
        this.targetProficiency = targetProficiency;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSuggestedTitle() {
        return suggestedTitle;
    }

    public void setSuggestedTitle(String suggestedTitle) {
        this.suggestedTitle = suggestedTitle;
    }

    public String getSuggestedDescription() {
        return suggestedDescription;
    }

    public void setSuggestedDescription(String suggestedDescription) {
        this.suggestedDescription = suggestedDescription;
    }
}
