import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

export interface NotFoundPageProps {
  className?: string;
}

export const NotFoundPage: React.FC<Readonly<NotFoundPageProps>> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <EmptyState
        icon="explore_off"
        title="This page does not exist"
        description="The link may be out of date. Head back to the discovery feed and start again."
        actionLabel="Back home"
        onAction={() => navigate('/')}
        className="max-w-lg"
      />
    </div>
  );
};

export default NotFoundPage;
