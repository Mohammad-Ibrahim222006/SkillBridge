package com.skillbridge.dto.response;

import java.util.List;

public class ProjectDetailResponse extends ProjectResponse {
    private List<TeamMemberResponse> members;
    private List<TaskResponse> tasks;
    private double taskCompletionPercentage;
    private boolean isCurrentUserMember;
    private boolean isCurrentUserOwner;
    private String currentUserRole; // OWNER, LEAD, MEMBER, or null

    public ProjectDetailResponse() {}

    public List<TeamMemberResponse> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberResponse> members) {
        this.members = members;
    }

    public List<TaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }

    public double getTaskCompletionPercentage() {
        return taskCompletionPercentage;
    }

    public void setTaskCompletionPercentage(double taskCompletionPercentage) {
        this.taskCompletionPercentage = taskCompletionPercentage;
    }

    public boolean isCurrentUserMember() {
        return isCurrentUserMember;
    }

    public void setCurrentUserMember(boolean currentUserMember) {
        isCurrentUserMember = currentUserMember;
    }

    public boolean isCurrentUserOwner() {
        return isCurrentUserOwner;
    }

    public void setCurrentUserOwner(boolean currentUserOwner) {
        isCurrentUserOwner = currentUserOwner;
    }

    public String getCurrentUserRole() {
        return currentUserRole;
    }

    public void setCurrentUserRole(String currentUserRole) {
        this.currentUserRole = currentUserRole;
    }
}
