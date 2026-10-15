package com.skillbridge.controller;

import com.skillbridge.dto.request.ProfileUpdateRequest;
import com.skillbridge.dto.request.UserSkillRequest;
import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.UserProfileResponse;
import com.skillbridge.dto.response.UserSkillResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "Student profile, technical skills, and portfolio management")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get current student profile with completeness metrics")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse profile = profileService.getCurrentUserProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile loaded successfully", profile));
    }

    @PutMapping
    @Operation(summary = "Update student bio, education, interests, and portfolio links")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        UserProfileResponse profile = profileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", profile));
    }

    @GetMapping("/skills")
    @Operation(summary = "Get list of technical skills added by current student")
    public ResponseEntity<ApiResponse<List<UserSkillResponse>>> getUserSkills(@AuthenticationPrincipal UserPrincipal principal) {
        List<UserSkillResponse> skills = profileService.getUserSkills(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Skills retrieved successfully", skills));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add or update a technical skill with proficiency level")
    public ResponseEntity<ApiResponse<UserSkillResponse>> addUserSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserSkillRequest request) {
        UserSkillResponse skill = profileService.addUserSkill(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Skill saved successfully", skill), HttpStatus.CREATED);
    }

    @DeleteMapping("/skills/{skillId}")
    @Operation(summary = "Remove a skill from the student's profile")
    public ResponseEntity<ApiResponse<Void>> deleteUserSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long skillId) {
        profileService.deleteUserSkill(principal.getId(), skillId);
        return ResponseEntity.ok(ApiResponse.ok("Skill removed successfully"));
    }
}
