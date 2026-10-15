package com.skillbridge.dto.response;

import java.util.ArrayList;
import java.util.List;

public class DashboardResponse {
    private UserProfileResponse profile;
    private int profileCompleteness;
    private long totalSkills;
    private long activeGoals;
    private long completedGoals;
    private long createdProjects;
    private long joinedProjects;
    private long pendingInvitations;
    private long assignedTasks;
    private long completedTasks;
    private double overallTaskCompletionRate;

    private List<NotificationResponse> recentNotifications = new ArrayList<>();
    private List<ProjectResponse> recommendedProjects = new ArrayList<>();
    private List<TaskResponse> urgentTasks = new ArrayList<>();
    private List<LearningGoalResponse> activeGoalsList = new ArrayList<>();

    public DashboardResponse() {}

    public UserProfileResponse getProfile() {
        return profile;
    }

    public void setProfile(UserProfileResponse profile) {
        this.profile = profile;
    }

    public int getProfileCompleteness() {
        return profileCompleteness;
    }

    public void setProfileCompleteness(int profileCompleteness) {
        this.profileCompleteness = profileCompleteness;
    }

    public long getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(long totalSkills) {
        this.totalSkills = totalSkills;
    }

    public long getActiveGoals() {
        return activeGoals;
    }

    public void setActiveGoals(long activeGoals) {
        this.activeGoals = activeGoals;
    }

    public long getCompletedGoals() {
        return completedGoals;
    }

    public void setCompletedGoals(long completedGoals) {
        this.completedGoals = completedGoals;
    }

    public long getCreatedProjects() {
        return createdProjects;
    }

    public void setCreatedProjects(long createdProjects) {
        this.createdProjects = createdProjects;
    }

    public long getJoinedProjects() {
        return joinedProjects;
    }

    public void setJoinedProjects(long joinedProjects) {
        this.joinedProjects = joinedProjects;
    }

    public long getPendingInvitations() {
        return pendingInvitations;
    }

    public void setPendingInvitations(long pendingInvitations) {
        this.pendingInvitations = pendingInvitations;
    }

    public long getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(long assignedTasks) {
        this.assignedTasks = assignedTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public double getOverallTaskCompletionRate() {
        return overallTaskCompletionRate;
    }

    public void setOverallTaskCompletionRate(double overallTaskCompletionRate) {
        this.overallTaskCompletionRate = overallTaskCompletionRate;
    }

    public List<NotificationResponse> getRecentNotifications() {
        return recentNotifications;
    }

    public void setRecentNotifications(List<NotificationResponse> recentNotifications) {
        this.recentNotifications = recentNotifications;
    }

    public List<ProjectResponse> getRecommendedProjects() {
        return recommendedProjects;
    }

    public void setRecommendedProjects(List<ProjectResponse> recommendedProjects) {
        this.recommendedProjects = recommendedProjects;
    }

    public List<TaskResponse> getUrgentTasks() {
        return urgentTasks;
    }

    public void setUrgentTasks(List<TaskResponse> urgentTasks) {
        this.urgentTasks = urgentTasks;
    }

    public List<LearningGoalResponse> getActiveGoalsList() {
        return activeGoalsList;
    }

    public void setActiveGoalsList(List<LearningGoalResponse> activeGoalsList) {
        this.activeGoalsList = activeGoalsList;
    }
}
