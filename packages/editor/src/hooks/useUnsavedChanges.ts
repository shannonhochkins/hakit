import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGlobalStore } from './useGlobalStore';
import { useParams } from '@tanstack/react-router';
import { PuckPageData } from '@typings/puck';
import { updateDashboardPageForUser } from '@services/dashboard';
import { type PuckAction } from '@measured/puck';
import { deepCopy } from 'deep-copy-ts';
import { trimPuckDataToConfig } from '@helpers/editor/pageData/trimPuckDataToConfig';
import { dbValueToPuck } from '@helpers/editor/pageData/dbValueToPuck';
import { toast } from 'react-toastify';

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

export function useUnsavedChanges(): UnsavedChangesState {
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
    shouldThrow: false,
  });

  // Generate unique key for this dashboard/page combination
  const storageKey = useMemo(() => {
    if (!params?.dashboardPath || !params?.pagePath) return null;
    return `hakit-autosave-${params.dashboardPath}-${params.pagePath}`;
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
      return JSON.parse(stored) as {
        data: PuckPageData;
        timestamp: string;
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  const setStoredData = useCallback(
    (data: PuckPageData) => {
      if (!storageKey) return;
      try {
        const saveData = {
          data: deepCopy(data),
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        console.log('💾 [UnsavedChanges] Data saved to localStorage');
      } catch (error) {
        console.error('💾 [UnsavedChanges] Failed to save:', error);
      }
    },
    [storageKey]
  );

  const removeStoredData = useCallback(() => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    console.log('🗑️ [UnsavedChanges] Local storage cleared');
  }, [storageKey]);

  // Check if we have unsaved changes (diff between puckPageData and unsavedPuckPageData)
  const hasUnsavedChanges = useMemo(() => {
    if (!puckPageData || !unsavedPuckPageData) {
      return false;
    }
    return Object.keys(unsavedPuckPageData).length > 0;
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
          // Different data found, show recovery prompt
          console.log('🚨 [UnsavedChanges] Recovery prompt triggered - local changes detected');
          setLocalSaveTime(new Date(stored.timestamp));
          setShowRecoveryPrompt(true);
          setHasPrompted(true);
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
      });
      return;
    }
    if (!userConfig) {
      toast('User configuration is missing, unable to restore', {
        type: 'error',
      });
      return;
    }
    const updated = trimPuckDataToConfig(stored.data, userConfig);
    if (!updated) {
      toast('Failed to trim stored data to user config, unable to restore', {
        type: 'error',
      });
      return;
    }
    const puckValue = dbValueToPuck(updated, activeBreakpoint);
    // Update internal puck data
    setPuckPageData(puckValue);
    // the user has accepted the recovery, so we update the dashboard page data
    // in the db
    updateDashboardPageForUser(
      dashboard.id,
      {
        id: page.id,
        data: puckValue,
      },
      {
        success: 'Recovery successful, Dashboard saved',
        error: 'Failed to update dashboard page data after recovery',
      }
    ).finally(() => {
      setShowRecoveryPrompt(false);
    });
  }, [params, getStoredData, removeStoredData]);

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
