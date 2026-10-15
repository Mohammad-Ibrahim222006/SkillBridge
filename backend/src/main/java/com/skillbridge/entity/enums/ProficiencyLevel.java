package com.skillbridge.entity.enums;

public enum ProficiencyLevel {
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3);

    private final int level;

    ProficiencyLevel(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }
}
