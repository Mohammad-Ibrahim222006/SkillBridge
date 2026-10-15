package com.skillbridge.repository;

import com.skillbridge.entity.Project;
import com.skillbridge.entity.enums.ProjectDifficulty;
import com.skillbridge.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerId(Long ownerId);

    long countByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN p.skillRequirements req " +
           "LEFT JOIN req.skill s " +
           "WHERE (:status IS NULL OR p.status = :status) " +
           "AND (:difficulty IS NULL OR p.difficulty = :difficulty) " +
           "AND (:category IS NULL OR LOWER(p.category) = LOWER(:category)) " +
           "AND (:query IS NULL OR (" +
           "   LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<Project> searchProjects(
            @Param("query") String query,
            @Param("status") ProjectStatus status,
            @Param("difficulty") ProjectDifficulty difficulty,
            @Param("category") String category,
            Pageable pageable);
}
