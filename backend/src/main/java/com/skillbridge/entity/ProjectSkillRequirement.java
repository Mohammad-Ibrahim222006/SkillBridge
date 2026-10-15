package com.skillbridge.entity;

import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;
import jakarta.persistence.*;

@Entity
@Table(name = "project_skill_requirements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_project_skill", columnNames = {"project_id", "skill_id"})
}, indexes = {
    @Index(name = "idx_psr_project", columnList = "project_id"),
    @Index(name = "idx_psr_skill", columnList = "skill_id")
})
public class ProjectSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_proficiency", nullable = false, length = 20)
    private ProficiencyLevel requiredProficiency = ProficiencyLevel.INTERMEDIATE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequirementWeight weight = RequirementWeight.MEDIUM;

    public ProjectSkillRequirement() {}

    public ProjectSkillRequirement(Project project, Skill skill, ProficiencyLevel requiredProficiency, RequirementWeight weight) {
        this.project = project;
        this.skill = skill;
        this.requiredProficiency = requiredProficiency != null ? requiredProficiency : ProficiencyLevel.INTERMEDIATE;
        this.weight = weight != null ? weight : RequirementWeight.MEDIUM;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
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
