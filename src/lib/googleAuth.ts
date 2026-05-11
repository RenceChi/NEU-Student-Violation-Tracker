import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { supabase } from './supabase';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(
  onSuccess: (userId: string) => void,
  onError: (msg: string) => void,
) {
  const [loading, setLoading] = useState(false);

  const promptAsync = useCallback(async () => {
    setLoading(true);
    try {
      const redirectTo = makeRedirectUri({
        scheme: 'exp',
        native: 'neustudentviolationtracker://',
        });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        onError(error?.message ?? 'Could not start Google sign-in.');
        return;
      }

      // Open the Google login page in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type !== 'success') {
        // User cancelled or browser closed — not an error
        return;
      }

      // Extract tokens from the redirect URL
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token') 
        ?? new URLSearchParams(url.hash.slice(1)).get('access_token');
      const refreshToken = url.searchParams.get('refresh_token')
        ?? new URLSearchParams(url.hash.slice(1)).get('refresh_token');

      if (!accessToken) {
        onError('Google sign-in did not return a token. Please try again.');
        return;
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? '',
        });

      if (sessionError || !sessionData?.user) {
        onError(sessionError?.message ?? 'Failed to establish session.');
        return;
      }

      onSuccess(sessionData.user.id);

    } catch (e: any) {
      onError(e.message ?? 'Unexpected error during Google sign-in.');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  return { promptAsync, loading };
}