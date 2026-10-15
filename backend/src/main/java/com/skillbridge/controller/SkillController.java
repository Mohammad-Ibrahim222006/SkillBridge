package com.skillbridge.controller;

import com.skillbridge.dto.request.SkillCreateRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.SkillResponse;
import com.skillbridge.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@Tag(name = "Skills Catalog", description = "Browse standardized technical skills across frontend, backend, data, and devops")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    @Operation(summary = "Get all technology skills, optionally filtered by category")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getAllSkills(
            @RequestParam(required = false) String category) {
        List<SkillResponse> skills = (category != null && !category.isBlank())
                ? skillService.getSkillsByCategory(category)
                : skillService.getAllSkills();
        return ResponseEntity.ok(ApiResponse.ok("Skills retrieved successfully", skills));
    }

    @PostMapping
    @Operation(summary = "Add a new standardized technology skill to the catalog")
    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(@Valid @RequestBody SkillCreateRequest request) {
        SkillResponse skill = skillService.createSkill(request);
        return new ResponseEntity<>(ApiResponse.ok("Skill created successfully", skill), HttpStatus.CREATED);
    }
}
