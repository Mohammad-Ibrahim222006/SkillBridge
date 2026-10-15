package com.skillbridge.controller;

import com.skillbridge.dto.request.ProjectRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.ProjectDetailResponse;
import com.skillbridge.dto.response.ProjectResponse;
import com.skillbridge.entity.enums.ProjectDifficulty;
import com.skillbridge.entity.enums.ProjectStatus;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project creation, discovery, filtering, and requirement specifications")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Search projects with filters for status, difficulty, category, and dynamic match calculation")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> searchProjects(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ProjectDifficulty difficulty,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Long currentUserId = principal != null ? principal.getId() : null;

        Page<ProjectResponse> projects = projectService.searchProjects(query, status, difficulty, category, pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Projects loaded successfully", projects));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed project information including required skills, team members, and tasks")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> getProjectDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        ProjectDetailResponse detail = projectService.getProjectDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Project details loaded successfully", detail));
    }

    @PostMapping
    @Operation(summary = "Create a new student project with skill requirements and team capacity")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectRequest request) {
        ProjectDetailResponse created = projectService.createProject(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Project created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project information and skill requirements (Owner only)")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> updateProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectRequest request) {
        ProjectDetailResponse updated = projectService.updateProject(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project and associated resources (Owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.deleteProject(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully"));
    }
}
