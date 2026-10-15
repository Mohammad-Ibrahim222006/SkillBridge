package com.skillbridge.service;

import com.skillbridge.dto.response.UserSummaryResponse;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.repository.UserSkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ProfileService profileService;

    public UserService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            ProfileService profileService) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.profileService = profileService;
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> searchStudents(String query, Long skillId, Pageable pageable) {
        Page<User> users;
        if (StringUtils.hasText(query)) {
            users = userRepository.searchUsers(query.trim(), pageable);
        } else {
            users = userRepository.findByActiveTrue(pageable);
        }

        List<UserSummaryResponse> dtos = users.getContent().stream()
                .filter(u -> {
                    if (skillId == null) return true;
                    List<UserSkill> skills = userSkillRepository.findByUserId(u.getId());
                    return skills.stream().anyMatch(s -> s.getSkill().getId().equals(skillId));
                })
                .map(this::mapToUserSummaryResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, users.getTotalElements());
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getStudentById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + userId));
        return mapToUserSummaryResponse(user);
    }

    private UserSummaryResponse mapToUserSummaryResponse(User user) {
        UserSummaryResponse resp = new UserSummaryResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setBio(user.getBio());
        resp.setEducation(user.getEducation());
        resp.setInterests(user.getInterests());
        resp.setGithubUrl(user.getGithubUrl());
        resp.setLinkedinUrl(user.getLinkedinUrl());
        resp.setPortfolioUrl(user.getPortfolioUrl());
        resp.setRole(user.getRole());
        resp.setActive(user.isActive());
        resp.setCreatedAt(user.getCreatedAt());
        resp.setSkills(profileService.getUserSkills(user.getId()));
        return resp;
    }
}
