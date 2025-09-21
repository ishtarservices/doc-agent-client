import { createContext } from 'react';
import type { OrganizationData, AvailableAgent } from '@/lib/api';

export interface OrganizationContextType {
  currentOrganization: OrganizationData | null;
  setCurrentOrganization: (org: OrganizationData | null) => void;
  isLoading: boolean;
  organizations: OrganizationData[];
  isOrgSwitching: boolean; // Global flag to prevent queries during org switches
  availableAgents: AvailableAgent[];
  isLoadingAgents: boolean;
  refetchAgents: () => void;
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);