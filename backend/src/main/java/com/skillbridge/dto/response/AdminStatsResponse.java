package com.skillbridge.dto.response;

public class AdminStatsResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalAdmins;
    private long totalProjects;
    private long openProjects;
    private long inProgressProjects;
    private long completedProjects;
    private long totalSkills;
    private long totalUserSkills;
    private long totalTasks;
    private long completedTasks;
    private long totalGoals;
    private long totalInvitations;

    public AdminStatsResponse() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getOpenProjects() {
        return openProjects;
    }

    public void setOpenProjects(long openProjects) {
        this.openProjects = openProjects;
    }

    public long getInProgressProjects() {
        return inProgressProjects;
    }

    public void setInProgressProjects(long inProgressProjects) {
        this.inProgressProjects = inProgressProjects;
    }

    public long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public long getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(long totalSkills) {
        this.totalSkills = totalSkills;
    }

    public long getTotalUserSkills() {
        return totalUserSkills;
    }

    public void setTotalUserSkills(long totalUserSkills) {
        this.totalUserSkills = totalUserSkills;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getTotalGoals() {
        return totalGoals;
    }

    public void setTotalGoals(long totalGoals) {
        this.totalGoals = totalGoals;
    }

    public long getTotalInvitations() {
        return totalInvitations;
    }

    public void setTotalInvitations(long totalInvitations) {
        this.totalInvitations = totalInvitations;
    }
}
