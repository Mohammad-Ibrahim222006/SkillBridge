package com.skillbridge.controller;

import com.skillbridge.dto.response.ApiResponse;
import com.skillbridge.dto.response.DashboardResponse;
import com.skillbridge.security.UserPrincipal;
import com.skillbridge.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Consolidated live metrics, project recommendations, tasks, and notification feeds")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get consolidated student dashboard with live database metrics and recommendations")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardResponse dashboard = dashboardService.getDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Dashboard data loaded successfully", dashboard));
    }
}
