package com.skillbridge.dto.response;

import java.util.ArrayList;
import java.util.List;

public class SkillGapAnalysisResponse {
    private Long projectId;
    private String projectTitle;
    private double coveragePercentage;
    private String overallGapSeverity; // MINIMAL, MODERATE, HIGH, CRITICAL
    private int totalRequirementsCount;
    private int satisfiedRequirementsCount;
    private int improvableRequirementsCount;
    private int missingRequirementsCount;

    private List<SkillMatchItem> satisfiedRequirements = new ArrayList<>();
    private List<SkillMatchItem> improvableRequirements = new ArrayList<>();
    private List<SkillMatchItem> missingRequirements = new ArrayList<>();
    private List<LearningSuggestion> learningSuggestions = new ArrayList<>();

    public SkillGapAnalysisResponse() {}

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

    public String getOverallGapSeverity() {
        return overallGapSeverity;
    }

    public void setOverallGapSeverity(String overallGapSeverity) {
        this.overallGapSeverity = overallGapSeverity;
    }

    public int getTotalRequirementsCount() {
        return totalRequirementsCount;
    }

    public void setTotalRequirementsCount(int totalRequirementsCount) {
        this.totalRequirementsCount = totalRequirementsCount;
    }

    public int getSatisfiedRequirementsCount() {
        return satisfiedRequirementsCount;
    }

    public void setSatisfiedRequirementsCount(int satisfiedRequirementsCount) {
        this.satisfiedRequirementsCount = satisfiedRequirementsCount;
    }

    public int getImprovableRequirementsCount() {
        return improvableRequirementsCount;
    }

    public void setImprovableRequirementsCount(int improvableRequirementsCount) {
        this.improvableRequirementsCount = improvableRequirementsCount;
    }

    public int getMissingRequirementsCount() {
        return missingRequirementsCount;
    }

    public void setMissingRequirementsCount(int missingRequirementsCount) {
        this.missingRequirementsCount = missingRequirementsCount;
    }

    public List<SkillMatchItem> getSatisfiedRequirements() {
        return satisfiedRequirements;
    }

    public void setSatisfiedRequirements(List<SkillMatchItem> satisfiedRequirements) {
        this.satisfiedRequirements = satisfiedRequirements;
    }

    public List<SkillMatchItem> getImprovableRequirements() {
        return improvableRequirements;
    }

    public void setImprovableRequirements(List<SkillMatchItem> improvableRequirements) {
        this.improvableRequirements = improvableRequirements;
    }

    public List<SkillMatchItem> getMissingRequirements() {
        return missingRequirements;
    }

    public void setMissingRequirements(List<SkillMatchItem> missingRequirements) {
        this.missingRequirements = missingRequirements;
    }

    public List<LearningSuggestion> getLearningSuggestions() {
        return learningSuggestions;
    }

    public void setLearningSuggestions(List<LearningSuggestion> learningSuggestions) {
        this.learningSuggestions = learningSuggestions;
    }
}
