import React from 'react';
import { DOCTOR_MAP } from '../data/doctors';

export default function DoctorBadge({
  doctorCode,
  size = 'md',
  showInitialOnly = false,
  isHighlighted = false,
  isDimmed = false,
  onClick,
  className = '',
}) {
  const doctor = DOCTOR_MAP[doctorCode];

  if (!doctor) {
    return (
      <span className="inline-flex items-center text-xs text-slate-400 italic">
        Unassigned
      </span>
    );
  }

  const { theme, shortName, code } = doctor;

  // Size variations
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[11px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  };

  const avatarSize = {
    xs: 'w-3.5 h-3.5 text-[9px]',
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-xs',
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`inline-flex items-center rounded-lg border font-medium transition-all duration-150 select-none ${
        theme.badgeBg
      } ${theme.badgeText} ${theme.badgeBorder} ${
        onClick ? `${theme.badgeHover} cursor-pointer active:scale-95` : ''
      } ${sizeStyles[size] || sizeStyles.md} ${
        isHighlighted
          ? `ring-2 ${theme.ringColor} shadow-sm font-bold scale-[1.02]`
          : ''
      } ${isDimmed ? 'opacity-35 grayscale-[40%]' : 'opacity-100'} ${className}`}
      title={`${doctor.name} (${doctor.role})`}
    >
      <span
        className={`flex items-center justify-center rounded-full text-white font-bold shrink-0 shadow-xs ${
          theme.avatarBg
        } ${avatarSize[size] || avatarSize.md}`}
      >
        {code}
      </span>
      {!showInitialOnly && (
        <span className="truncate max-w-[110px] tracking-tight">
          {shortName}
        </span>
      )}
    </span>
  );
}
