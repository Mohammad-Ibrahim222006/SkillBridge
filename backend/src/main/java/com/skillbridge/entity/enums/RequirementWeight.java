package com.skillbridge.entity.enums;

public enum RequirementWeight {
    LOW(1.0),
    MEDIUM(2.0),
    HIGH(3.0);

    private final double weight;

    RequirementWeight(double weight) {
        this.weight = weight;
    }

    public double getWeight() {
        return weight;
    }
}
