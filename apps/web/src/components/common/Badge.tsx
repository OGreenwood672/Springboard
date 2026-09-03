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
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-xs',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-xs',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-xs',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-xs',
    slate: 'bg-slate-800 text-slate-300 border-slate-700 shadow-xs',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-tight',
    md: 'text-xs px-2.5 py-0.5 font-mono font-bold tracking-tight',
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
