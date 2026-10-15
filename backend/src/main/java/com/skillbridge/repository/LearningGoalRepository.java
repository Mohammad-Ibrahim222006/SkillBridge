package com.skillbridge.repository;

import com.skillbridge.entity.LearningGoal;
import com.skillbridge.entity.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningGoalRepository extends JpaRepository<LearningGoal, Long> {

    List<LearningGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<LearningGoal> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndStatus(Long userId, GoalStatus status);

    long countByUserId(Long userId);
}
