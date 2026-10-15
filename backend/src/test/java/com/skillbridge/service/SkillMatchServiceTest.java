package com.skillbridge.service;

import com.skillbridge.dto.response.SkillGapAnalysisResponse;
import com.skillbridge.dto.response.SkillMatchResultResponse;
import com.skillbridge.entity.*;
import com.skillbridge.entity.enums.ProficiencyLevel;
import com.skillbridge.entity.enums.RequirementWeight;
import com.skillbridge.repository.ProjectRepository;
import com.skillbridge.repository.ProjectSkillRequirementRepository;
import com.skillbridge.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SkillMatchServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectSkillRequirementRepository requirementRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @InjectMocks
    private SkillMatchService skillMatchService;

    private Project sampleProject;
    private User sampleUser;
    private Skill javaSkill;
    private Skill reactSkill;
    private Skill dockerSkill;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setFullName("Test Student");

        sampleProject = new Project();
        sampleProject.setId(10L);
        sampleProject.setTitle("Test FullStack Project");
        sampleProject.setOwner(sampleUser);

        javaSkill = new Skill("Java", "Backend", "Enterprise Java");
        javaSkill.setId(101L);

        reactSkill = new Skill("React", "Frontend", "React Web");
        reactSkill.setId(102L);

        dockerSkill = new Skill("Docker", "DevOps", "Containers");
        dockerSkill.setId(103L);
    }

    @Test
    @DisplayName("Should return 100% coverage when user satisfies all project requirements with equal or higher proficiency")
    void testFullSkillMatch() {
        // Project requires: Java (Intermediate, High weight), React (Beginner, Medium weight)
        ProjectSkillRequirement req1 = new ProjectSkillRequirement(sampleProject, javaSkill, ProficiencyLevel.INTERMEDIATE, RequirementWeight.HIGH);
        ProjectSkillRequirement req2 = new ProjectSkillRequirement(sampleProject, reactSkill, ProficiencyLevel.BEGINNER, RequirementWeight.MEDIUM);
        List<ProjectSkillRequirement> reqs = List.of(req1, req2);

        // User has: Java (Advanced >= Intermediate), React (Intermediate >= Beginner)
        UserSkill us1 = new UserSkill(sampleUser, javaSkill, ProficiencyLevel.ADVANCED, 2.0);
        UserSkill us2 = new UserSkill(sampleUser, reactSkill, ProficiencyLevel.INTERMEDIATE, 1.0);
        List<UserSkill> userSkills = List.of(us1, us2);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        when(requirementRepository.findByProjectIdWithSkill(10L)).thenReturn(reqs);
        when(userSkillRepository.findByUserIdWithSkill(1L)).thenReturn(userSkills);

        SkillMatchResultResponse result = skillMatchService.calculateMatch(10L, 1L);

        assertNotNull(result);
        assertEquals(100.0, result.getCoveragePercentage());
        assertEquals(2, result.getSatisfiedSkills().size());
        assertTrue(result.getInsufficientSkills().isEmpty());
        assertTrue(result.getMissingSkills().isEmpty());
        assertTrue(result.getExplanation().contains("100.0%"));
    }

    @Test
    @DisplayName("Should compute accurate partial credit when user proficiency is lower than required")
    void testPartialSkillMatchFormula() {
        // Project requires: Java (Advanced level 3, Weight HIGH = 3.0 points)
        // User has: Java (Beginner level 1) -> earned ratio = 1/3 -> earned = 1.0 point out of 3.0
        // Expected coverage = (1.0 / 3.0) * 100 = 33.3%
        ProjectSkillRequirement req1 = new ProjectSkillRequirement(sampleProject, javaSkill, ProficiencyLevel.ADVANCED, RequirementWeight.HIGH);
        List<ProjectSkillRequirement> reqs = List.of(req1);

        UserSkill us1 = new UserSkill(sampleUser, javaSkill, ProficiencyLevel.BEGINNER, 0.5);
        List<UserSkill> userSkills = List.of(us1);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        when(requirementRepository.findByProjectIdWithSkill(10L)).thenReturn(reqs);
        when(userSkillRepository.findByUserIdWithSkill(1L)).thenReturn(userSkills);

        SkillMatchResultResponse result = skillMatchService.calculateMatch(10L, 1L);

        assertEquals(33.3, result.getCoveragePercentage());
        assertEquals(1, result.getInsufficientSkills().size());
        assertEquals(0, result.getSatisfiedSkills().size());
        assertEquals(0, result.getMissingSkills().size());
    }

    @Test
    @DisplayName("Should return 0% coverage and mark skills as missing when student lacks required skills")
    void testMissingSkillHandling() {
        ProjectSkillRequirement req1 = new ProjectSkillRequirement(sampleProject, dockerSkill, ProficiencyLevel.INTERMEDIATE, RequirementWeight.HIGH);
        List<ProjectSkillRequirement> reqs = List.of(req1);

        List<UserSkill> userSkills = new ArrayList<>(); // User has no skills

        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        when(requirementRepository.findByProjectIdWithSkill(10L)).thenReturn(reqs);
        when(userSkillRepository.findByUserIdWithSkill(1L)).thenReturn(userSkills);

        SkillMatchResultResponse result = skillMatchService.calculateMatch(10L, 1L);

        assertEquals(0.0, result.getCoveragePercentage());
        assertEquals(1, result.getMissingSkills().size());
        assertEquals(1, result.getRecommendedSkillsToLearn().size());
    }

    @Test
    @DisplayName("Should safely handle projects with empty requirements by returning 100% coverage")
    void testEmptyRequirementsSafeHandling() {
        List<ProjectSkillRequirement> emptyReqs = new ArrayList<>();
        List<UserSkill> userSkills = new ArrayList<>();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        when(requirementRepository.findByProjectIdWithSkill(10L)).thenReturn(emptyReqs);
        when(userSkillRepository.findByUserIdWithSkill(1L)).thenReturn(userSkills);

        SkillMatchResultResponse result = skillMatchService.calculateMatch(10L, 1L);

        assertEquals(100.0, result.getCoveragePercentage());
        assertTrue(result.getExplanation().contains("no specific technical skill requirements"));
    }

    @Test
    @DisplayName("Should perform skill-gap analysis and generate prioritized deterministic learning suggestions")
    void testSkillGapAnalysisSuggestions() {
        ProjectSkillRequirement reqJava = new ProjectSkillRequirement(sampleProject, javaSkill, ProficiencyLevel.INTERMEDIATE, RequirementWeight.MEDIUM);
        ProjectSkillRequirement reqDocker = new ProjectSkillRequirement(sampleProject, dockerSkill, ProficiencyLevel.ADVANCED, RequirementWeight.HIGH);
        List<ProjectSkillRequirement> reqs = List.of(reqJava, reqDocker);

        // User only has Java at Intermediate (satisfied), missing Docker (Critical gap)
        UserSkill usJava = new UserSkill(sampleUser, javaSkill, ProficiencyLevel.INTERMEDIATE, 2.0);
        List<UserSkill> userSkills = List.of(usJava);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        when(requirementRepository.findByProjectIdWithSkill(10L)).thenReturn(reqs);
        when(userSkillRepository.findByUserIdWithSkill(1L)).thenReturn(userSkills);

        SkillGapAnalysisResponse gap = skillMatchService.analyzeSkillGap(10L, 1L);

        assertNotNull(gap);
        assertEquals(1, gap.getSatisfiedRequirementsCount());
        assertEquals(1, gap.getMissingRequirementsCount());
        assertEquals(0, gap.getImprovableRequirementsCount());
        assertFalse(gap.getLearningSuggestions().isEmpty());

        // Ensure Docker suggestion is ranked HIGH priority because requirement weight is HIGH
        assertEquals("HIGH", gap.getLearningSuggestions().get(0).getPriority());
        assertEquals("Docker", gap.getLearningSuggestions().get(0).getSkillName());
    }
}
