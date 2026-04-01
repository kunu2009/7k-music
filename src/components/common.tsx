import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizeClasses[size]} border-4 border-blue-200/20 border-t-blue-100 rounded-full animate-spin`} />
      {text && (
        <p className="text-blue-100/75 text-sm">{text}</p>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="glass-surface rounded-3xl flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      {icon && (
        <div className="text-blue-100/45">
          {icon}
        </div>
      )}
      <h3 className="text-white text-xl font-semibold">{title}</h3>
      {description && (
        <p className="text-blue-100/75 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-3 pill-action font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface VideoGridSkeletonProps {
  count?: number;
}

export const VideoGridSkeleton: React.FC<VideoGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-surface rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-blue-200/10" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-blue-200/10 rounded w-full" />
            <div className="h-4 bg-blue-200/10 rounded w-3/4" />
            <div className="h-3 bg-blue-200/10 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
