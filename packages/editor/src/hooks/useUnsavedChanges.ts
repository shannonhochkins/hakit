import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGlobalStore } from './useGlobalStore';
import { useParams } from '@tanstack/react-router';
import { PuckPageData } from '@typings/puck';
import { updateDashboardPageForUser, dashboardByPathWithPageDataQueryOptions } from '@services/dashboard';
import { type PuckAction } from '@measured/puck';
import { toast } from 'react-toastify';
import deepEqual from 'deep-equal';
import { deserializePageData, serializeWithUndefined } from '@shared/helpers/customSerialize';
import { useQueryClient } from '@tanstack/react-query';
import { sanitizePuckData } from '@helpers/editor/pageData/sanitizePuckData';

const TIME_THRESHOLD_SECONDS = 1; // Threshold for showing recovery prompt

interface UnsavedChangesState {
  // Status flags
  hasUnsavedChanges: boolean;
  hasLocalChanges: boolean;

  // Recovery prompt state
  showRecoveryPrompt: boolean;
  hasCheckedOnLoad: boolean;
  localSaveTime: Date | null;

  // Actions
  removeStoredData: () => void;
  acceptRecovery: () => void;
  rejectRecovery: () => void;
  revertChanges: (dispatch: (dispatch: PuckAction) => void) => void;

  // Data access
  getStoredData: () => { data: PuckPageData; timestamp: string } | null;
}

export function getStorageKey(dashboardPath: string, pagePath: string): string | null {
  return `hakit-autosave-${dashboardPath}-${pagePath}`;
}

export function useUnsavedChanges(): UnsavedChangesState {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
    shouldThrow: false,
  });

  // Generate unique key for this dashboard/page combination
  const storageKey = useMemo(() => {
    if (!params?.dashboardPath || !params?.pagePath) return null;
    return getStorageKey(params.dashboardPath, params.pagePath);
  }, [params?.dashboardPath, params?.pagePath]);

  // Global store state
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const unsavedPuckPageData = useGlobalStore(state => state.unsavedPuckPageData);

  // Local state
  const [hasCheckedOnLoad, setHasCheckedOnLoad] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [localSaveTime, setLocalSaveTime] = useState<Date | null>(null);
  const [hasPrompted, setHasPrompted] = useState(false);

  // localStorage helpers
  const getStoredData = useCallback(() => {
    if (!storageKey) return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const raw = JSON.parse(stored) as {
        data: PuckPageData;
        timestamp: string;
      };
      // Ensure we deserialize the data to restore undefined values
      raw.data = deserializePageData(JSON.stringify(raw.data), true); // Deserialize to restore undefined values
      return raw;
    } catch {
      return null;
    }
  }, [storageKey]);

  const setStoredData = useCallback(
    (data: PuckPageData) => {
      if (!storageKey) return;
      try {
        const saveData = {
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, serializeWithUndefined(saveData));
      } catch (error) {
        console.error('💾 [UnsavedChanges] Failed to save:', error);
      }
    },
    [storageKey]
  );

  const removeStoredData = useCallback(() => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Check if we have unsaved changes (diff between puckPageData and unsavedPuckPageData)
  const hasUnsavedChanges = useMemo(() => {
    if (!puckPageData || !unsavedPuckPageData) {
      return false;
    }
    return deepEqual(puckPageData, unsavedPuckPageData) === false;
  }, [puckPageData, unsavedPuckPageData]);

  // Update localStorage whenever unsavedPuckPageData changes
  useEffect(() => {
    if (unsavedPuckPageData && hasUnsavedChanges) {
      setStoredData(unsavedPuckPageData);
    }
  }, [unsavedPuckPageData, hasUnsavedChanges, setStoredData]);

  // Check if we have stored data that differs from current puckPageData
  const hasLocalChanges = useMemo(() => {
    const stored = getStoredData();
    if (!stored?.data) {
      return false;
    }
    return true;
  }, [getStoredData]);

  // Check for existing data on load and show recovery prompt if needed
  useEffect(() => {
    if (hasCheckedOnLoad) return;

    const stored = getStoredData();
    if (stored?.data) {
      try {
        if (!hasPrompted) {
          // Check if the stored data is older than 30 seconds
          const storedTime = new Date(stored.timestamp);
          const now = new Date();
          const timeDiffInSeconds = (now.getTime() - storedTime.getTime()) / 1000;

          // Only show recovery prompt if data is older than 30 seconds
          // This helps distinguish between navigation (fresh data) and refresh/return (old data)
          if (timeDiffInSeconds > TIME_THRESHOLD_SECONDS) {
            setLocalSaveTime(storedTime);
            setShowRecoveryPrompt(true);
            setHasPrompted(true);
          }
        }
      } catch (error) {
        console.error('🚨 [UnsavedChanges] Error checking stored data on load:', error);
      }
    }

    setHasCheckedOnLoad(true);
  }, [getStoredData, removeStoredData, hasCheckedOnLoad, hasPrompted]);

  const acceptRecovery = useCallback(() => {
    const stored = getStoredData();
    if (!stored?.data) return;
    const { dashboard, setPuckPageData, userConfig, activeBreakpoint } = useGlobalStore.getState();
    // remove local storage data always
    removeStoredData();
    const page = dashboard?.pages.find(page => page.path === params?.pagePath);
    if (!dashboard || !page) {
      toast('Dashboard or page unavailable, unable to restore', {
        type: 'error',
        theme: 'dark',
      });
      return;
    }
    if (!userConfig) {
      toast('User configuration is missing, unable to restore', {
        type: 'error',
        theme: 'dark',
      });
      return;
    }
    const sanitizedData = sanitizePuckData({
      data: stored.data,
      userConfig,
      activeBreakpoint,
      removeBreakpoints: false,
    });
    if (!sanitizedData) {
      toast('Failed to sanitize stored data, unable to restore', {
        type: 'error',
        theme: 'dark',
      });
      return;
    }
    // Update internal puck data
    setPuckPageData(sanitizedData);
    // the user has accepted the recovery, so we update the dashboard page data
    // in the db
    updateDashboardPageForUser(
      dashboard.id,
      {
        id: page.id,
        data: sanitizedData,
      },
      {
        success: 'Recovery successful, Dashboard saved',
        error: 'Failed to update dashboard page data after recovery',
      }
    ).finally(() => {
      // Invalidate the dashboard query to trigger a refetch
      // This will automatically update the store via useDashboardWithData
      if (params?.dashboardPath) {
        const queryKey = dashboardByPathWithPageDataQueryOptions(params.dashboardPath).queryKey;
        queryClient.invalidateQueries({ queryKey });
      }
      setShowRecoveryPrompt(false);
    });
  }, [params, getStoredData, removeStoredData, queryClient]);

  const rejectRecovery = useCallback(() => {
    removeStoredData();
    setShowRecoveryPrompt(false);
  }, [removeStoredData]);

  const revertChanges = useCallback((dispatch: (dispatch: PuckAction) => void) => {
    const { puckPageData, setUnsavedPuckPageData } = useGlobalStore.getState();
    dispatch({
      type: 'setData',
      data: puckPageData || {},
    });
    // this also essentially sets `hasUnsavedChanges` to false to hide the revert button
    setTimeout(() => {
      // push to the next tick so the Puck.onChange event doesn't trigger immediately
      setUnsavedPuckPageData(null);
    }, 0);
  }, []);

  return {
    // Status flags
    hasUnsavedChanges,
    hasLocalChanges,

    // Recovery prompt state
    showRecoveryPrompt,
    hasCheckedOnLoad,
    localSaveTime,

    // Actions
    removeStoredData,
    acceptRecovery,
    rejectRecovery,
    revertChanges,

    // Data access
    getStoredData,
  };
}
