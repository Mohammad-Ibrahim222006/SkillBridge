package com.skillbridge.dto.request;

import com.skillbridge.entity.enums.MembershipRole;
import jakarta.validation.constraints.NotNull;

public class InvitationRequest {

    @NotNull(message = "Invitee user ID is required")
    private Long inviteeId;

    private String message;
    private MembershipRole role = MembershipRole.MEMBER;

    public InvitationRequest() {}

    public Long getInviteeId() {
        return inviteeId;
    }

    public void setInviteeId(Long inviteeId) {
        this.inviteeId = inviteeId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public MembershipRole getRole() {
        return role;
    }

    public void setRole(MembershipRole role) {
        this.role = role;
    }
}
