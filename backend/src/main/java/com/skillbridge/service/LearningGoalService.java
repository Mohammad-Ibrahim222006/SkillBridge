package com.skillbridge.service;

import com.skillbridge.dto.request.LearningGoalRequest;
import com.skillbridge.dto.response.LearningGoalResponse;
import com.skillbridge.entity.LearningGoal;
import com.skillbridge.entity.Skill;
import com.skillbridge.entity.User;
import com.skillbridge.entity.enums.GoalStatus;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.LearningGoalRepository;
import com.skillbridge.repository.SkillRepository;
import com.skillbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningGoalService {

    private final LearningGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public LearningGoalService(
            LearningGoalRepository goalRepository,
            UserRepository userRepository,
            SkillRepository skillRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<LearningGoalResponse> getUserGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LearningGoalResponse createGoal(Long userId, LearningGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Skill targetSkill = null;
        if (request.getTargetSkillId() != null) {
            targetSkill = skillRepository.findById(request.getTargetSkillId()).orElse(null);
        }

        LearningGoal goal = new LearningGoal();
        goal.setUser(user);
        goal.setTitle(request.getTitle().trim());
        goal.setDescription(request.getDescription());
        goal.setTargetSkill(targetSkill);
        goal.setTargetSkillName(request.getTargetSkillName() != null ? request.getTargetSkillName() : (targetSkill != null ? targetSkill.getName() : null));
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(request.getStatus() != null ? request.getStatus() : GoalStatus.NOT_STARTED);
        goal.setProgressPercentage(request.getProgressPercentage() != null ? request.getProgressPercentage() : 0);

        if (goal.getProgressPercentage() == 100) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else if (goal.getProgressPercentage() > 0 && goal.getStatus() == GoalStatus.NOT_STARTED) {
            goal.setStatus(GoalStatus.IN_PROGRESS);
        }

        LearningGoal saved = goalRepository.save(goal);
        return mapToGoalResponse(saved);
    }

    @Transactional
    public LearningGoalResponse updateGoal(Long goalId, Long userId, LearningGoalRequest request) {
        LearningGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own learning goals");
        }

        goal.setTitle(request.getTitle().trim());
        goal.setDescription(request.getDescription());
        if (request.getTargetSkillId() != null) {
            Skill skill = skillRepository.findById(request.getTargetSkillId()).orElse(null);
            goal.setTargetSkill(skill);
        }
        if (request.getTargetSkillName() != null) {
            goal.setTargetSkillName(request.getTargetSkillName());
        }
        goal.setTargetDate(request.getTargetDate());
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }
        if (request.getProgressPercentage() != null) {
            goal.setProgressPercentage(request.getProgressPercentage());
            if (goal.getProgressPercentage() == 100) {
                goal.setStatus(GoalStatus.COMPLETED);
            }
        }

        LearningGoal saved = goalRepository.save(goal);
        return mapToGoalResponse(saved);
    }

    @Transactional
    public void deleteGoal(Long goalId, Long userId) {
        LearningGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own learning goals");
        }

        goalRepository.delete(goal);
    }

    public LearningGoalResponse mapToGoalResponse(LearningGoal goal) {
        LearningGoalResponse resp = new LearningGoalResponse();
        resp.setId(goal.getId());
        resp.setTitle(goal.getTitle());
        resp.setDescription(goal.getDescription());
        if (goal.getTargetSkill() != null) {
            resp.setTargetSkillId(goal.getTargetSkill().getId());
            resp.setTargetSkillName(goal.getTargetSkill().getName());
        } else {
            resp.setTargetSkillName(goal.getTargetSkillName());
        }
        resp.setTargetDate(goal.getTargetDate());
        resp.setStatus(goal.getStatus());
        resp.setProgressPercentage(goal.getProgressPercentage());
        resp.setCreatedAt(goal.getCreatedAt());
        resp.setUpdatedAt(goal.getUpdatedAt());
        return resp;
    }
}
