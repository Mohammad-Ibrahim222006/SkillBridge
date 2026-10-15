package com.skillbridge.repository;

import com.skillbridge.entity.Task;
import com.skillbridge.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Task> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);

    Optional<Task> findByIdAndProjectId(Long id, Long projectId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    long countByAssigneeId(Long assigneeId);

    @Query("SELECT t FROM Task t " +
           "LEFT JOIN FETCH t.assignee " +
           "JOIN FETCH t.creator " +
           "WHERE t.project.id = :projectId ORDER BY t.createdAt DESC")
    List<Task> findByProjectIdWithUsers(@Param("projectId") Long projectId);
}
