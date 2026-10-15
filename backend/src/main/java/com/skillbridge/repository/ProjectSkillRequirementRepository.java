package com.skillbridge.repository;

import com.skillbridge.entity.ProjectSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectSkillRequirementRepository extends JpaRepository<ProjectSkillRequirement, Long> {

    List<ProjectSkillRequirement> findByProjectId(Long projectId);

    Optional<ProjectSkillRequirement> findByProjectIdAndSkillId(Long projectId, Long skillId);

    void deleteByProjectIdAndSkillId(Long projectId, Long skillId);

    void deleteByProjectId(Long projectId);

    @Query("SELECT psr FROM ProjectSkillRequirement psr JOIN FETCH psr.skill WHERE psr.project.id = :projectId")
    List<ProjectSkillRequirement> findByProjectIdWithSkill(@Param("projectId") Long projectId);
}
