package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.ProficiencyLevel;
import java.time.LocalDateTime;

public class UserSkillResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private ProficiencyLevel proficiency;
    private int proficiencyNumeric;
    private Double yearsOfExperience;
    private LocalDateTime createdAt;

    public UserSkillResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        if (proficiency != null) {
            this.proficiencyNumeric = proficiency.getLevel();
        }
    }

    public int getProficiencyNumeric() {
        return proficiencyNumeric;
    }

    public void setProficiencyNumeric(int proficiencyNumeric) {
        this.proficiencyNumeric = proficiencyNumeric;
    }

    public Double getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Double yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
