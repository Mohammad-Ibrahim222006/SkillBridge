package com.skillbridge.controller;

import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.SkillGapAnalysisResponse;
import com.skillbridge.dto.response.SkillMatchResultResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.SkillMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{id}")
@Tag(name = "Skill Matching & Gap Analysis", description = "Deterministic skill-matching engine, proficiency coverage calculation, and gap analysis")
public class SkillMatchController {

    private final SkillMatchService skillMatchService;

    public SkillMatchController(SkillMatchService skillMatchService) {
        this.skillMatchService = skillMatchService;
    }

    @GetMapping("/match")
    @Operation(summary = "Calculate explainable skill-matching coverage score for authenticated student against project")
    public ResponseEntity<ApiResponse<SkillMatchResultResponse>> calculateMatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SkillMatchResultResponse matchResult = skillMatchService.calculateMatch(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Match score calculated successfully", matchResult));
    }

    @GetMapping("/skill-gap")
    @Operation(summary = "Perform in-depth skill-gap analysis with prioritized learning recommendations")
    public ResponseEntity<ApiResponse<SkillGapAnalysisResponse>> analyzeSkillGap(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SkillGapAnalysisResponse gapAnalysis = skillMatchService.analyzeSkillGap(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Skill-gap analysis completed successfully", gapAnalysis));
    }
}
