import React from 'react';
import { OpportunityType, OpportunityStatus, ApplicationStatus, WorkplaceType } from '@springboard/shared-types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const OpportunityTypeBadge: React.FC<{ type: OpportunityType; size?: 'sm' | 'md' }> = ({
  type,
  size = 'md',
}) => {
  switch (type) {
    case 'part_time_job':
      return (
        <Badge variant="emerald" size={size}>
          Part-time Job
        </Badge>
      );
    case 'work_experience':
      return (
        <Badge variant="indigo" size={size}>
          Work Experience
        </Badge>
      );
    case 'volunteering':
      return (
        <Badge variant="purple" size={size}>
          Volunteering
        </Badge>
      );
    default:
      return <Badge variant="slate" size={size}>{type}</Badge>;
  }
};

export const WorkplaceBadge: React.FC<{ type: WorkplaceType; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  switch (type) {
    case 'remote':
      return (
        <Badge variant="sky" size={size}>
          🌐 Remote
        </Badge>
      );
    case 'hybrid':
      return (
        <Badge variant="indigo" size={size}>
          🏢 Hybrid
        </Badge>
      );
    case 'in_person':
      return (
        <Badge variant="slate" size={size}>
          📍 In-person
        </Badge>
      );
    default:
      return <Badge variant="slate" size={size}>{type}</Badge>;
  }
};

export const OpportunityStatusBadge: React.FC<{ status: OpportunityStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'published':
      return (
        <Badge variant="emerald" size={size}>
          ● Published
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="amber" size={size}>
          ○ Draft
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="rose" size={size}>
          ✕ Closed
        </Badge>
      );
    default:
      return <Badge variant="slate" size={size}>{status}</Badge>;
  }
};

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'submitted':
      return <Badge variant="sky" size={size}>Submitted</Badge>;
    case 'reviewed':
      return <Badge variant="indigo" size={size}>Reviewed</Badge>;
    case 'shortlisted':
      return <Badge variant="emerald" size={size}>★ Shortlisted</Badge>;
    case 'accepted':
      return <Badge variant="emerald" size={size}>✓ Accepted</Badge>;
    case 'rejected':
      return <Badge variant="rose" size={size}>Not Selected</Badge>;
    case 'withdrawn':
      return <Badge variant="slate" size={size}>Withdrawn</Badge>;
    default:
      return <Badge variant="slate" size={size}>{status}</Badge>;
  }
};
