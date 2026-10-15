package com.skillbridge.dto.response;

import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;

public class SkillMatchItem {
    private Long skillId;
    private String skillName;
    private String category;
    private ProficiencyLevel userProficiency;
    private ProficiencyLevel requiredProficiency;
    private RequirementWeight weight;
    private double weightValue;
    private String status; // FULL_MATCH, PARTIAL_MATCH, MISSING
    private double scoreEarned;
    private double maxScore;

    public SkillMatchItem() {}

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

    public ProficiencyLevel getUserProficiency() {
        return userProficiency;
    }

    public void setUserProficiency(ProficiencyLevel userProficiency) {
        this.userProficiency = userProficiency;
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
        if (weight != null) {
            this.weightValue = weight.getWeight();
        }
    }

    public double getWeightValue() {
        return weightValue;
    }

    public void setWeightValue(double weightValue) {
        this.weightValue = weightValue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getScoreEarned() {
        return scoreEarned;
    }

    public void setScoreEarned(double scoreEarned) {
        this.scoreEarned = scoreEarned;
    }

    public double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }
}
