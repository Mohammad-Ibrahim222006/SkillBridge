package com.skillbridge.repository;

import com.skillbridge.entity.ProjectInvitation;
import com.skillbridge.entity.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {

    List<ProjectInvitation> findByInviteeIdOrderByCreatedAtDesc(Long inviteeId);

    List<ProjectInvitation> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<ProjectInvitation> findByIdAndInviteeId(Long id, Long inviteeId);

    boolean existsByProjectIdAndInviteeIdAndStatus(Long projectId, Long inviteeId, InvitationStatus status);

    long countByInviteeIdAndStatus(Long inviteeId, InvitationStatus status);

    @Query("SELECT pi FROM ProjectInvitation pi " +
           "JOIN FETCH pi.project " +
           "JOIN FETCH pi.inviter " +
           "WHERE pi.invitee.id = :inviteeId ORDER BY pi.createdAt DESC")
    List<ProjectInvitation> findByInviteeIdWithDetails(@Param("inviteeId") Long inviteeId);
}
