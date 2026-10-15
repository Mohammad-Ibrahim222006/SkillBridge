package com.skillbridge.dto.request;

import com.skillbridge.entity.enums.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;

public class UserSkillRequest {

    private Long skillId;
    private String skillName;
    private String category;

    @NotNull(message = "Proficiency level is required (BEGINNER, INTERMEDIATE, ADVANCED)")
    private ProficiencyLevel proficiency;

    private Double yearsOfExperience = 0.0;

    public UserSkillRequest() {}

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ProficiencyLevel getProficiency() {
        return proficiency;
    }

    public void setProficiency(ProficiencyLevel proficiency) {
        this.proficiency = proficiency;
    }

    public Double getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Double yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
}
