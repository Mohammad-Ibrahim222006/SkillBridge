package com.skillbridge.entity;

import com.skillbridge.entity.enums.GoalStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_goals", indexes = {
    @Index(name = "idx_goal_user", columnList = "user_id"),
    @Index(name = "idx_goal_status", columnList = "status")
})
public class LearningGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_skill_id")
    private Skill targetSkill;

    @Column(name = "target_skill_name", length = 100)
    private String targetSkillName;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status = GoalStatus.NOT_STARTED;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LearningGoal() {}

    public LearningGoal(User user, String title, String description, Skill targetSkill, String targetSkillName, LocalDate targetDate) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.targetSkill = targetSkill;
        this.targetSkillName = targetSkillName != null ? targetSkillName : (targetSkill != null ? targetSkill.getName() : null);
        this.targetDate = targetDate;
        this.status = GoalStatus.NOT_STARTED;
        this.progressPercentage = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Skill getTargetSkill() {
        return targetSkill;
    }

    public void setTargetSkill(Skill targetSkill) {
        this.targetSkill = targetSkill;
        if (targetSkill != null && this.targetSkillName == null) {
            this.targetSkillName = targetSkill.getName();
        }
    }

    public String getTargetSkillName() {
        return targetSkillName;
    }

    public void setTargetSkillName(String targetSkillName) {
        this.targetSkillName = targetSkillName;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
