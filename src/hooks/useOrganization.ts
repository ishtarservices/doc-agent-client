import { useContext } from 'react';
import { OrganizationContext } from '@/contexts/OrganizationContext.types';

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};