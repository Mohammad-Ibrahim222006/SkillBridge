package com.skillbridge.controller;

import com.skillbridge.dto.response.AdminStatsResponse;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.UserSummaryResponse;
import com.skillbridge.entity.enums.ProjectStatus;
import com.skillbridge.entity.enums.Role;
import com.skillbridge.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Administration", description = "Platform management, user administration, project moderation, and platform statistics (ROLE_ADMIN only)")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overall platform usage and entity statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        AdminStatsResponse stats = adminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.ok("Platform statistics loaded successfully", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "List all platform users with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<UserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserSummaryResponse> users = adminService.getAllUsers(query, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Enable or disable user account access")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> toggleUserStatus(@PathVariable Long id) {
        UserSummaryResponse updated = adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", updated));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change a user's role (ROLE_STUDENT or ROLE_ADMIN)")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        UserSummaryResponse updated = adminService.changeUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", updated));
    }

    @PatchMapping("/projects/{id}/status")
    @Operation(summary = "Moderate project status (OPEN, IN_PROGRESS, COMPLETED, ARCHIVED)")
    public ResponseEntity<ApiResponse<Void>> moderateProject(
            @PathVariable Long id,
            @RequestParam ProjectStatus status) {
        adminService.moderateProject(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Project status updated successfully"));
    }
}
