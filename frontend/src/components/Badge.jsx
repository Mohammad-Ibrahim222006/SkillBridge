import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return <span className="badge badge-success">Open for Teammates</span>;
    case 'IN_PROGRESS':
      return <span className="badge badge-warning">In Progress</span>;
    case 'COMPLETED':
      return <span className="badge badge-primary">Completed</span>;
    case 'ARCHIVED':
      return <span className="badge badge-neutral">Archived</span>;
    case 'PENDING':
      return <span className="badge badge-warning">Pending</span>;
    case 'ACCEPTED':
      return <span className="badge badge-success">Accepted</span>;
    case 'REJECTED':
      return <span className="badge badge-danger">Declined</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
};

export const ProficiencyBadge = ({ level }) => {
  switch (level) {
    case 'ADVANCED':
      return <span className="badge badge-primary">Advanced</span>;
    case 'INTERMEDIATE':
      return <span className="badge badge-success">Intermediate</span>;
    case 'BEGINNER':
      return <span className="badge badge-neutral">Beginner</span>;
    default:
      return <span className="badge badge-neutral">{level}</span>;
  }
};

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return <span className="badge badge-danger">Urgent</span>;
    case 'HIGH':
      return <span className="badge badge-warning">High</span>;
    case 'MEDIUM':
      return <span className="badge badge-primary">Medium</span>;
    case 'LOW':
      return <span className="badge badge-neutral">Low</span>;
    default:
      return <span className="badge badge-neutral">{priority}</span>;
  }
};

export const MatchBadge = ({ score }) => {
  if (score == null) return null;
  let cls = 'badge-danger';
  if (score >= 80) cls = 'badge-success';
  else if (score >= 50) cls = 'badge-warning';

  return (
    <span className={`badge ${cls}`} style={{ fontWeight: 700 }}>
      {Math.round(score)}% Match
    </span>
  );
};

export const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;

