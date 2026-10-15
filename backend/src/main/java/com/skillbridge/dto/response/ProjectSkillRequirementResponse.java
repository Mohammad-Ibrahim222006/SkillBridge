package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;

public class ProjectSkillRequirementResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private ProficiencyLevel requiredProficiency;
    private int requiredProficiencyNumeric;
    private RequirementWeight weight;
    private double weightNumeric;

    public ProjectSkillRequirementResponse() {}

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

    public ProficiencyLevel getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(ProficiencyLevel requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
        if (requiredProficiency != null) {
            this.requiredProficiencyNumeric = requiredProficiency.getLevel();
        }
    }

    public int getRequiredProficiencyNumeric() {
        return requiredProficiencyNumeric;
    }

    public void setRequiredProficiencyNumeric(int requiredProficiencyNumeric) {
        this.requiredProficiencyNumeric = requiredProficiencyNumeric;
    }

    public RequirementWeight getWeight() {
        return weight;
    }

    public void setWeight(RequirementWeight weight) {
        this.weight = weight;
        if (weight != null) {
            this.weightNumeric = weight.getWeight();
        }
    }

    public double getWeightNumeric() {
        return weightNumeric;
    }

    public void setWeightNumeric(double weightNumeric) {
        this.weightNumeric = weightNumeric;
    }
}
