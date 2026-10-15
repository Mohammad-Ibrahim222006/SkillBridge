package com.skillbridge.service;

import com.skillbridge.dto.response.LearningSuggestion;
import com.skillbridge.dto.response.SkillGapAnalysisResponse;
import com.skillbridge.dto.response.SkillMatchItem;
import com.skillbridge.dto.response.SkillMatchResultResponse;
import com.skillbridge.entity.Project;
import com.skillbridge.entity.ProjectSkillRequirement;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.ProjectRepository;
import com.skillbridge.repository.ProjectSkillRequirementRepository;
import com.skillbridge.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillMatchService {

    private final ProjectRepository projectRepository;
    private final ProjectSkillRequirementRepository requirementRepository;
    private final UserSkillRepository userSkillRepository;

    public SkillMatchService(
            ProjectRepository projectRepository,
            ProjectSkillRequirementRepository requirementRepository,
            UserSkillRepository userSkillRepository) {
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Transactional(readOnly = true)
    public SkillMatchResultResponse calculateMatch(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        List<ProjectSkillRequirement> requirements = requirementRepository.findByProjectIdWithSkill(projectId);
        List<UserSkill> userSkills = userSkillRepository.findByUserIdWithSkill(userId);

        return computeMatchScore(project, requirements, userSkills);
    }

    @Transactional(readOnly = true)
    public SkillGapAnalysisResponse analyzeSkillGap(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        List<ProjectSkillRequirement> requirements = requirementRepository.findByProjectIdWithSkill(projectId);
        List<UserSkill> userSkills = userSkillRepository.findByUserIdWithSkill(userId);

        SkillMatchResultResponse matchResult = computeMatchScore(project, requirements, userSkills);

        SkillGapAnalysisResponse gapResponse = new SkillGapAnalysisResponse();
        gapResponse.setProjectId(project.getId());
        gapResponse.setProjectTitle(project.getTitle());
        gapResponse.setCoveragePercentage(matchResult.getCoveragePercentage());
        gapResponse.setTotalRequirementsCount(requirements.size());

        List<SkillMatchItem> satisfied = new ArrayList<>();
        List<SkillMatchItem> improvable = new ArrayList<>();
        List<SkillMatchItem> missing = new ArrayList<>();
        List<LearningSuggestion> suggestions = new ArrayList<>();

        for (SkillMatchItem item : matchResult.getMatchItems()) {
            if ("FULL_MATCH".equals(item.getStatus())) {
                satisfied.add(item);
            } else if ("PARTIAL_MATCH".equals(item.getStatus())) {
                improvable.add(item);
                suggestions.add(new LearningSuggestion(
                        item.getSkillId(),
                        item.getSkillName(),
                        item.getUserProficiency(),
                        item.getRequiredProficiency(),
                        getPriority(item.getWeight()),
                        "Upgrade proficiency from " + item.getUserProficiency() + " to " + item.getRequiredProficiency() +
                                " to meet project expectations (" + item.getWeight() + " priority).",
                        "Master advanced " + item.getSkillName(),
                        "Complete targeted exercises and implement key architectural patterns in " + item.getSkillName() + "."
                ));
            } else {
                missing.add(item);
                suggestions.add(new LearningSuggestion(
                        item.getSkillId(),
                        item.getSkillName(),
                        null,
                        item.getRequiredProficiency(),
                        getPriority(item.getWeight()),
                        "Acquire fundamental knowledge in " + item.getSkillName() + " to satisfy the " +
                                item.getRequiredProficiency() + " level required by this project.",
                        "Learn " + item.getSkillName() + " foundations",
                        "Study the official documentation and build a starter project covering core principles of " + item.getSkillName() + "."
                ));
            }
        }

        // Sort suggestions by priority (HIGH first)
        suggestions.sort((a, b) -> {
            int pA = "HIGH".equals(a.getPriority()) ? 3 : ("MEDIUM".equals(a.getPriority()) ? 2 : 1);
            int pB = "HIGH".equals(b.getPriority()) ? 3 : ("MEDIUM".equals(b.getPriority()) ? 2 : 1);
            return Integer.compare(pB, pA);
        });

        gapResponse.setSatisfiedRequirements(satisfied);
        gapResponse.setImprovableRequirements(improvable);
        gapResponse.setMissingRequirements(missing);
        gapResponse.setSatisfiedRequirementsCount(satisfied.size());
        gapResponse.setImprovableRequirementsCount(improvable.size());
        gapResponse.setMissingRequirementsCount(missing.size());
        gapResponse.setLearningSuggestions(suggestions);

        // Calculate severity
        if (requirements.isEmpty() || matchResult.getCoveragePercentage() >= 90.0) {
            gapResponse.setOverallGapSeverity("MINIMAL");
        } else if (matchResult.getCoveragePercentage() >= 70.0) {
            gapResponse.setOverallGapSeverity("MODERATE");
        } else if (matchResult.getCoveragePercentage() >= 40.0) {
            gapResponse.setOverallGapSeverity("HIGH");
        } else {
            gapResponse.setOverallGapSeverity("CRITICAL");
        }

        return gapResponse;
    }

    public SkillMatchResultResponse computeMatchScore(
            Project project,
            List<ProjectSkillRequirement> requirements,
            List<UserSkill> userSkills) {

        SkillMatchResultResponse response = new SkillMatchResultResponse();
        response.setProjectId(project.getId());
        response.setProjectTitle(project.getTitle());

        if (requirements == null || requirements.isEmpty()) {
            response.setCoveragePercentage(100.0);
            response.setExplanation("This project has no specific technical skill requirements. Open to students of all skill levels (100% coverage).");
            return response;
        }

        // Map user skills by skill ID and normalized name for flexible matching
        Map<Long, UserSkill> userSkillsById = new HashMap<>();
        Map<String, UserSkill> userSkillsByName = new HashMap<>();
        for (UserSkill us : userSkills) {
            userSkillsById.put(us.getSkill().getId(), us);
            userSkillsByName.put(us.getSkill().getName().trim().toLowerCase(), us);
        }

        double totalMaxWeight = 0.0;
        double earnedWeight = 0.0;

        List<SkillMatchItem> matchItems = new ArrayList<>();
        List<String> satisfied = new ArrayList<>();
        List<String> insufficient = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        List<String> recommended = new ArrayList<>();

        for (ProjectSkillRequirement req : requirements) {
            double weightVal = req.getWeight() != null ? req.getWeight().getWeight() : RequirementWeight.MEDIUM.getWeight();
            totalMaxWeight += weightVal;

            SkillMatchItem item = new SkillMatchItem();
            item.setSkillId(req.getSkill().getId());
            item.setSkillName(req.getSkill().getName());
            item.setCategory(req.getSkill().getCategory());
            item.setRequiredProficiency(req.getRequiredProficiency());
            item.setWeight(req.getWeight());
            item.setWeightValue(weightVal);
            item.setMaxScore(weightVal);

            // Check if user has this skill
            UserSkill userSkill = userSkillsById.get(req.getSkill().getId());
            if (userSkill == null) {
                userSkill = userSkillsByName.get(req.getSkill().getName().trim().toLowerCase());
            }

            if (userSkill != null) {
                item.setUserProficiency(userSkill.getProficiency());
                int userLevel = userSkill.getProficiency().getLevel();
                int reqLevel = req.getRequiredProficiency().getLevel();

                if (userLevel >= reqLevel) {
                    item.setStatus("FULL_MATCH");
                    item.setScoreEarned(weightVal);
                    earnedWeight += weightVal;
                    satisfied.add(req.getSkill().getName() + " (" + userSkill.getProficiency() + ")");
                } else {
                    item.setStatus("PARTIAL_MATCH");
                    double partialRatio = (double) userLevel / reqLevel;
                    double partialScore = weightVal * partialRatio;
                    item.setScoreEarned(round(partialScore, 2));
                    earnedWeight += partialScore;
                    insufficient.add(req.getSkill().getName() + " (Has " + userSkill.getProficiency() + ", needs " + req.getRequiredProficiency() + ")");
                    recommended.add(req.getSkill().getName() + " (Upgrade to " + req.getRequiredProficiency() + ")");
                }
            } else {
                item.setUserProficiency(null);
                item.setStatus("MISSING");
                item.setScoreEarned(0.0);
                missing.add(req.getSkill().getName() + " (Needs " + req.getRequiredProficiency() + ")");
                recommended.add(req.getSkill().getName() + " (Learn " + req.getRequiredProficiency() + ")");
            }

            matchItems.add(item);
        }

        double rawCoverage = totalMaxWeight > 0 ? (earnedWeight / totalMaxWeight) * 100.0 : 0.0;
        double roundedCoverage = round(rawCoverage, 1);

        response.setCoveragePercentage(roundedCoverage);
        response.setMatchItems(matchItems);
        response.setSatisfiedSkills(satisfied);
        response.setInsufficientSkills(insufficient);
        response.setMissingSkills(missing);
        response.setRecommendedSkillsToLearn(recommended);

        StringBuilder expl = new StringBuilder();
        expl.append("Deterministic coverage: ").append(roundedCoverage).append("% (Earned ")
                .append(round(earnedWeight, 2)).append(" of ").append(round(totalMaxWeight, 2))
                .append(" total weighted requirement points across ").append(requirements.size()).append(" requirements). ");
        expl.append("Full matches: ").append(satisfied.size()).append("; ");
        expl.append("Proficiency gaps: ").append(insufficient.size()).append("; ");
        expl.append("Missing skills: ").append(missing.size()).append(". ");
        expl.append("Calculated using the weighted formula: 100 * sum(earned_weight) / sum(requirement_weight).");

        response.setExplanation(expl.toString());
        return response;
    }

    private String getPriority(RequirementWeight weight) {
        if (weight == RequirementWeight.HIGH) return "HIGH";
        if (weight == RequirementWeight.MEDIUM) return "MEDIUM";
        return "LOW";
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
