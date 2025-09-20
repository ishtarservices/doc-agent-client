import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext.types';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/useBoardData';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Prefetch user organizations when user logs in
        if (event === 'SIGNED_IN' && session?.user) {
          queryClient.prefetchQuery({
            queryKey: queryKeys.userOrganizations(),
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        }

        // Clear cached data when user logs out
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Prefetch user organizations if already logged in
      if (session?.user) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.userOrganizations(),
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('🔐 [AuthContext] Sign in error:', error);
    } else {
      console.log('🔐 [AuthContext] Sign in successful for:', email);
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('🔐 [AuthContext] Sign up error:', error);
    } else {
      console.log('🔐 [AuthContext] Sign up successful for:', email);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};