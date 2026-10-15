package com.skillbridge.controller;

import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.TeamMemberResponse;
import com.skillbridge.dto.response.TeammateRecommendationResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{id}")
@Tag(name = "Team Collaboration", description = "Team member management, roles, and complementary teammate recommendations")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping("/members")
    @Operation(summary = "Get all team members for a project")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getProjectMembers(@PathVariable Long id) {
        List<TeamMemberResponse> members = teamService.getProjectMembers(id);
        return ResponseEntity.ok(ApiResponse.ok("Team members retrieved successfully", members));
    }

    @GetMapping("/recommend-teammates")
    @Operation(summary = "Recommend candidate teammates with complementary skills covering team deficits")
    public ResponseEntity<ApiResponse<List<TeammateRecommendationResponse>>> recommendTeammates(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        List<TeammateRecommendationResponse> recommendations = teamService.recommendTeammates(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Teammate recommendations generated successfully", recommendations));
    }

    @DeleteMapping("/members/{memberUserId}")
    @Operation(summary = "Remove a member from the project team (Owner only)")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberUserId,
            @AuthenticationPrincipal UserPrincipal principal) {
        teamService.removeMember(id, memberUserId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member removed from team successfully"));
    }

    @PostMapping("/leave")
    @Operation(summary = "Leave a project team (Non-owner members only)")
    public ResponseEntity<ApiResponse<Void>> leaveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        teamService.leaveProject(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Successfully left the project team"));
    }
}
