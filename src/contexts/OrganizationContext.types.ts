import { createContext } from 'react';
import type { OrganizationData } from '@/lib/api';

export interface OrganizationContextType {
  currentOrganization: OrganizationData | null;
  setCurrentOrganization: (org: OrganizationData | null) => void;
  isLoading: boolean;
  organizations: OrganizationData[];
  isOrgSwitching: boolean; // Global flag to prevent queries during org switches
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);