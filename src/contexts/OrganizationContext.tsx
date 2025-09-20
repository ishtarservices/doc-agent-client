import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { OrganizationData } from '@/lib/api';
import { OrganizationContext } from './OrganizationContext.types';
import { useUserOrganizations, useEnsureUserOrganization } from '@/hooks/useBoardData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganizationState] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedEnsureOrg, setHasTriedEnsureOrg] = useState(false);
  const [isOrgSwitching, setIsOrgSwitching] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's organizations
  const { data: organizations, isLoading: isOrgLoading, error: orgError, refetch: refetchOrgs } = useUserOrganizations();

  // Mutation to ensure user has organization
  const { mutate: ensureUserOrg, isPending: isEnsuring } = useEnsureUserOrganization();


  // Load organization from localStorage on mount and set from API data
  useEffect(() => {

    if (isOrgLoading || !user) {
      setIsLoading(true);
      return;
    }

    const savedOrgId = localStorage.getItem('current-organization-id');
    const savedOrgData = localStorage.getItem('current-organization-data');

    // If we have organizations from API
    if (organizations && organizations.length > 0) {

      let selectedOrg: OrganizationData | null = null;

      // Try to find saved organization in fetched data
      if (savedOrgId) {
        selectedOrg = organizations.find(org => org._id === savedOrgId) || null;
      }

      // If no saved org or saved org not found, use the first organization
      if (!selectedOrg) {
        selectedOrg = organizations[0];
      }

      setCurrentOrganizationState(selectedOrg);

      // Update localStorage with the selected organization
      if (selectedOrg) {
        localStorage.setItem('current-organization-id', selectedOrg._id);
        localStorage.setItem('current-organization-data', JSON.stringify(selectedOrg));
      }
    } else if (!hasTriedEnsureOrg && user?.email) {

      // No organizations found and haven't tried creating one yet
      // Check if this is a 403 error indicating user needs organization membership
      if (orgError && orgError.message.includes('403')) {
        setHasTriedEnsureOrg(true);

        ensureUserOrg(
          { userEmail: user.email },
          {
            onSuccess: (newOrg) => {
              setCurrentOrganizationState(newOrg);
              localStorage.setItem('current-organization-id', newOrg._id);
              localStorage.setItem('current-organization-data', JSON.stringify(newOrg));
              // Refetch organizations to update the list
              refetchOrgs();
            },
            onError: (error) => {
              console.error('🏢 [OrganizationContext] Failed to setup user organization:', error);
              toast.error('Failed to setup your workspace. Please refresh and try again.');
            }
          }
        );
      } else {

        // Try loading from localStorage as fallback
        if (savedOrgId && savedOrgData) {
          try {
            const orgData = JSON.parse(savedOrgData);
            setCurrentOrganizationState(orgData);
          } catch (error) {
            console.error('🏢 [OrganizationContext] Failed to parse saved organization data:', error);
            localStorage.removeItem('current-organization-id');
            localStorage.removeItem('current-organization-data');
          }
        }
      }
    }

    setIsLoading(false);
  }, [organizations, isOrgLoading, user, orgError, hasTriedEnsureOrg, ensureUserOrg, refetchOrgs]);

  const setCurrentOrganization = (org: OrganizationData | null) => {
    const previousOrgId = currentOrganization?._id;
    const newOrgId = org?._id;

    // Clear relevant caches when switching organizations
    if (previousOrgId && newOrgId && previousOrgId !== newOrgId) {

      // Set global switching state FIRST to prevent any new queries
      setIsOrgSwitching(true);

      // First, cancel ALL running queries to prevent race conditions
      queryClient.cancelQueries({
        predicate: (query) => {
          const isProjectContext = query.queryKey[0] === 'project-context';
          if (isProjectContext) {
            console.log('🔄 [OrganizationContext] Cancelling query:', query.queryKey);
          }
          return isProjectContext;
        }
      });

      // Cancel organization-projects queries too
      queryClient.cancelQueries({
        queryKey: ['organization-projects', previousOrgId]
      });
      // Clear project data for previous organization
      queryClient.invalidateQueries({
        queryKey: ['organization-projects', previousOrgId]
      });

      // Clear all project context caches (since they might be from previous org)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const isProjectContext = query.queryKey[0] === 'project-context';
          if (isProjectContext) {
            console.log('🔄 [OrganizationContext] Invalidating cache:', query.queryKey);
          }
          return isProjectContext;
        }
      });

      // Remove cached data immediately
      queryClient.removeQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'project-context';
        }
      });
      // Reset switching state after a longer delay to ensure all queries are blocked
      setTimeout(() => {
        setIsOrgSwitching(false);
      }, 1000); // Increased to 1 second
    }

    setCurrentOrganizationState(org);

    if (org) {
      localStorage.setItem('current-organization-id', org._id);
      localStorage.setItem('current-organization-data', JSON.stringify(org));
    } else {
      localStorage.removeItem('current-organization-id');
      localStorage.removeItem('current-organization-data');
    }
  };

  const value = {
    currentOrganization,
    setCurrentOrganization,
    isLoading: isLoading || isOrgLoading || isEnsuring,
    organizations: organizations || [],
    isOrgSwitching, // Expose global org switching state
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};