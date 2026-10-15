package com.skillbridge.controller;

import com.skillbridge.dto.request.TaskRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.TaskResponse;
import com.skillbridge.entity.enums.TaskStatus;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Tasks", description = "Project task assignment, status updates, priority, and completion tracking")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Get all tasks for a project")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getProjectTasks(@PathVariable Long projectId) {
        List<TaskResponse> tasks = taskService.getProjectTasks(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Tasks retrieved successfully", tasks));
    }

    @PostMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Create a new task within a project (Team members only)")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(projectId, principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Task created successfully", task), HttpStatus.CREATED);
    }

    @PutMapping("/api/tasks/{taskId}")
    @Operation(summary = "Update task details, assignee, or priority")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.updateTask(taskId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", task));
    }

    @PatchMapping("/api/tasks/{taskId}/status")
    @Operation(summary = "Update task status (TODO, IN_PROGRESS, COMPLETED)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam TaskStatus status) {
        TaskResponse task = taskService.updateTaskStatus(taskId, principal.getId(), status);
        return ResponseEntity.ok(ApiResponse.ok("Task status updated successfully", task));
    }

    @DeleteMapping("/api/tasks/{taskId}")
    @Operation(summary = "Delete task (Creator or Project Owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(taskId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully"));
    }

    @GetMapping("/api/tasks/my")
    @Operation(summary = "Get all tasks assigned to the current authenticated student")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAssignedTasks(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TaskResponse> tasks = taskService.getAssignedTasks(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Assigned tasks loaded successfully", tasks));
    }
}
