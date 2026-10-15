package com.skillbridge.service;

import com.skillbridge.dto.request.SkillCreateRequest;
import com.skillbridge.dto.response.SkillResponse;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.ConflictException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::mapToSkillResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByCategory(String category) {
        return skillRepository.findByCategoryIgnoreCase(category)
                .stream()
                .map(this::mapToSkillResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Skill getSkillEntity(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + id));
    }

    @Transactional
    public SkillResponse createSkill(SkillCreateRequest request) {
        String normalizedName = request.getName().trim();
        if (skillRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ConflictException("Skill '" + normalizedName + "' already exists.");
        }

        Skill skill = new Skill();
        skill.setName(normalizedName);
        skill.setCategory(request.getCategory() != null ? request.getCategory().trim() : "General");
        skill.setDescription(request.getDescription());

        Skill saved = skillRepository.save(skill);
        return mapToSkillResponse(saved);
    }

    @Transactional
    public Skill findOrCreateSkill(String name, String category) {
        String normalizedName = name.trim();
        return skillRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setName(normalizedName);
                    newSkill.setCategory(category != null ? category.trim() : "General");
                    return skillRepository.save(newSkill);
                });
    }

    public SkillResponse mapToSkillResponse(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getDescription()
        );
    }
}
