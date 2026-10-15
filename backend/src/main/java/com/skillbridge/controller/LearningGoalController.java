package com.skillbridge.controller;

import com.skillbridge.dto.request.LearningGoalRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.LearningGoalResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.LearningGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@Tag(name = "Learning Goals", description = "Student learning objectives, target skills, deadlines, and progress completion")
public class LearningGoalController {

    private final LearningGoalService goalService;

    public LearningGoalController(LearningGoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    @Operation(summary = "Get all learning goals for the current student")
    public ResponseEntity<ApiResponse<List<LearningGoalResponse>>> getUserGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<LearningGoalResponse> goals = goalService.getUserGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Learning goals retrieved successfully", goals));
    }

    @PostMapping
    @Operation(summary = "Create a new learning goal linked to a skill or gap")
    public ResponseEntity<ApiResponse<LearningGoalResponse>> createGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LearningGoalRequest request) {
        LearningGoalResponse goal = goalService.createGoal(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Learning goal created successfully", goal), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update learning goal details, progress percentage, or status")
    public ResponseEntity<ApiResponse<LearningGoalResponse>> updateGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LearningGoalRequest request) {
        LearningGoalResponse goal = goalService.updateGoal(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Learning goal updated successfully", goal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a learning goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        goalService.deleteGoal(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Learning goal deleted successfully"));
    }
}
