package com.skillbridge.dto.response;

import java.util.ArrayList;
import java.util.List;

public class TeammateRecommendationResponse {
    private Long candidateId;
    private String fullName;
    private String email;
    private String bio;
    private String education;
    private String interests;
    private String githubUrl;
    private String linkedinUrl;
    private List<UserSkillResponse> skills = new ArrayList<>();
    private List<String> coveredMissingSkills = new ArrayList<>();
    private double complementaryScore;
    private String explanation;

    public TeammateRecommendationResponse() {}

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public List<UserSkillResponse> getSkills() {
        return skills;
    }

    public void setSkills(List<UserSkillResponse> skills) {
        this.skills = skills;
    }

    public List<String> getCoveredMissingSkills() {
        return coveredMissingSkills;
    }

    public void setCoveredMissingSkills(List<String> coveredMissingSkills) {
        this.coveredMissingSkills = coveredMissingSkills;
    }

    public double getComplementaryScore() {
        return complementaryScore;
    }

    public void setComplementaryScore(double complementaryScore) {
        this.complementaryScore = complementaryScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
