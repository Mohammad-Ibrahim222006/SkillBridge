package com.skillbridge.controller;

import com.skillbridge.dto.request.InvitationRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.InvitationResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Invitations", description = "Project team invitations, responses, and pending request tracking")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/api/projects/{projectId}/invitations")
    @Operation(summary = "Send an invitation to a student to join a project team (Owner only)")
    public ResponseEntity<ApiResponse<InvitationResponse>> sendInvitation(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InvitationRequest request) {
        InvitationResponse response = invitationService.sendInvitation(projectId, principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Invitation sent successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/projects/{projectId}/invitations")
    @Operation(summary = "Get all invitations sent for a project (Owner only)")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getProjectInvitations(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InvitationResponse> list = invitationService.getProjectInvitations(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project invitations retrieved successfully", list));
    }

    @GetMapping("/api/invitations")
    @Operation(summary = "Get all project invitations received by the current student")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getUserInvitations(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InvitationResponse> list = invitationService.getUserInvitations(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Invitations retrieved successfully", list));
    }

    @PostMapping("/api/invitations/{id}/accept")
    @Operation(summary = "Accept a project invitation and join the team")
    public ResponseEntity<ApiResponse<InvitationResponse>> acceptInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        InvitationResponse response = invitationService.respondToInvitation(id, principal.getId(), true);
        return ResponseEntity.ok(ApiResponse.ok("Invitation accepted! Welcome to the team.", response));
    }

    @PostMapping("/api/invitations/{id}/reject")
    @Operation(summary = "Decline a project invitation")
    public ResponseEntity<ApiResponse<InvitationResponse>> rejectInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        InvitationResponse response = invitationService.respondToInvitation(id, principal.getId(), false);
        return ResponseEntity.ok(ApiResponse.ok("Invitation declined.", response));
    }
}
