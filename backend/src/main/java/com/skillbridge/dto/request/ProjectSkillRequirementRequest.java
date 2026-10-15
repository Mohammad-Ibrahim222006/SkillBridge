package com.skillbridge.dto.request;

import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;
import jakarta.validation.constraints.NotNull;

public class ProjectSkillRequirementRequest {

    private Long skillId;
    private String skillName;
    private String category;

    @NotNull(message = "Required proficiency is required")
    private ProficiencyLevel requiredProficiency = ProficiencyLevel.INTERMEDIATE;

    @NotNull(message = "Requirement weight is required")
    private RequirementWeight weight = RequirementWeight.MEDIUM;

    public ProjectSkillRequirementRequest() {}

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

    public ProficiencyLevel getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(ProficiencyLevel requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
    }

    public RequirementWeight getWeight() {
        return weight;
    }

    public void setWeight(RequirementWeight weight) {
        this.weight = weight;
    }
}
