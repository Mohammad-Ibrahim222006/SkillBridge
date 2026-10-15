package com.skillbridge.dto.response;

import java.util.ArrayList;
import java.util.List;

public class SkillMatchResultResponse {
    private Long projectId;
    private String projectTitle;
    private double coveragePercentage;
    private List<SkillMatchItem> matchItems = new ArrayList<>();
    private List<String> satisfiedSkills = new ArrayList<>();
    private List<String> insufficientSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> recommendedSkillsToLearn = new ArrayList<>();
    private String explanation;

    public SkillMatchResultResponse() {}

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public double getCoveragePercentage() {
        return coveragePercentage;
    }

    public void setCoveragePercentage(double coveragePercentage) {
        this.coveragePercentage = coveragePercentage;
    }

    public List<SkillMatchItem> getMatchItems() {
        return matchItems;
    }

    public void setMatchItems(List<SkillMatchItem> matchItems) {
        this.matchItems = matchItems;
    }

    public List<String> getSatisfiedSkills() {
        return satisfiedSkills;
    }

    public void setSatisfiedSkills(List<String> satisfiedSkills) {
        this.satisfiedSkills = satisfiedSkills;
    }

    public List<String> getInsufficientSkills() {
        return insufficientSkills;
    }

    public void setInsufficientSkills(List<String> insufficientSkills) {
        this.insufficientSkills = insufficientSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getRecommendedSkillsToLearn() {
        return recommendedSkillsToLearn;
    }

    public void setRecommendedSkillsToLearn(List<String> recommendedSkillsToLearn) {
        this.recommendedSkillsToLearn = recommendedSkillsToLearn;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
