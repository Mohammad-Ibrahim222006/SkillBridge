package com.skillbridge.repository;

import com.skillbridge.entity.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {

    List<TeamMembership> findByProjectId(Long projectId);

    List<TeamMembership> findByUserId(Long userId);

    Optional<TeamMembership> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    long countByProjectId(Long projectId);

    long countByUserId(Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT tm FROM TeamMembership tm JOIN FETCH tm.user JOIN FETCH tm.project WHERE tm.project.id = :projectId")
    List<TeamMembership> findByProjectIdWithUser(@Param("projectId") Long projectId);
}
