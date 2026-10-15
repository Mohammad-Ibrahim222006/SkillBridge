package com.skillbridge.controller;

import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.UserSummaryResponse;
import com.skillbridge.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Student Discovery", description = "Find students by skills, interests, and complementary proficiencies")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Search and discover students with pagination and skill filters")
    public ResponseEntity<ApiResponse<Page<UserSummaryResponse>>> searchStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long skillId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserSummaryResponse> students = userService.searchStudents(query, skillId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Students retrieved successfully", students));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public student profile by ID")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getStudentById(@PathVariable Long id) {
        UserSummaryResponse student = userService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.ok("Student retrieved successfully", student));
    }
}
