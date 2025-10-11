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
      <div className={`${sizeClasses[size]} border-4 border-chathams-blue border-t-calypso rounded-full animate-spin`} />
      {text && (
        <p className="text-timberwolf text-sm opacity-75">{text}</p>
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
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      {icon && (
        <div className="text-timberwolf opacity-40">
          {icon}
        </div>
      )}
      <h3 className="text-white text-xl font-semibold">{title}</h3>
      {description && (
        <p className="text-timberwolf opacity-75 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-3 bg-calypso hover:bg-chathams-blue text-white font-medium rounded-full transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
