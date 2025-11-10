import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dashboardsQueryOptions,
  createDashboardPage,
  updateDashboardPageForUser,
  duplicateDashboardPage,
  dashboardByPathWithPageDataQueryOptions,
  dashboardByPathQueryOptions,
  dashboardPageQueryOptions,
} from '@services/dashboard';
import { nameToPath } from '@helpers/editor/routes/nameToPath';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { InputField } from '@components/Form/Field/Input';
import { ImageField } from '@components/Form/Field/Image';
import { Modal } from '@components/Modal';
import { DashboardPageWithoutData } from '@typings/hono';
import styles from './PageForm.module.css';
import { toast } from 'react-toastify';

interface PageFormProps {
  mode: 'new' | 'edit' | 'duplicate';
  dashboardId?: string;
  pageId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (page: DashboardPageWithoutData) => void;
}

export function PageForm({ mode = 'new', dashboardId, pageId, isOpen, onClose, onSuccess }: PageFormProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string>('');
  const [pathError, setPathError] = useState<string>('');
  const [pathTouched, setPathTouched] = useState(false);

  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = dashboardsQuery.data;
  const dashboard = dashboards?.find(d => d.id === dashboardId);
  const existingPage = dashboard?.pages.find(p => p.id === pageId);
  const queryClient = useQueryClient();

  // Initialize form when opening or mode/page changes
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && existingPage) {
      setName(existingPage.name);
      setPath(existingPage.path); // use existing page path directly
      setThumbnail(existingPage.thumbnail || '');
      setPathTouched(false);
    } else if (mode === 'duplicate' && existingPage) {
      setName(`${existingPage.name} (Copy)`);
      setPath(`${existingPage.path}-copy`);
      setThumbnail(existingPage.thumbnail || '');
      setPathTouched(true); // user likely will edit the generated copy path
    } else {
      setName('');
      setPath('');
      setThumbnail('');
      setPathTouched(false);
    }
    // reset errors
    setNameError('');
    setPathError('');
  }, [isOpen, mode, existingPage]);

  // Auto-generate path from name when not touched
  useEffect(() => {
    if (!isOpen) return;
    if (!pathTouched) {
      setPath(nameToPath(name));
    }
  }, [name, pathTouched, isOpen]);

  // Name validation effect
  useEffect(() => {
    if (!isOpen) return;
    if (!name.trim()) {
      setNameError('Page name is required');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('Page name must be at least 2 characters');
      return;
    }
    if (name.trim().length > 50) {
      setNameError('Page name must be less than 50 characters');
      return;
    }
    if (dashboard) {
      const duplicateName = dashboard.pages.find(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== pageId);
      if (duplicateName) {
        setNameError('A page with this name already exists in this dashboard');
        return;
      }
    }
    setNameError('');
  }, [name, dashboard, pageId, isOpen]);

  // Path validation effect
  useEffect(() => {
    if (!isOpen) return;
    if (!path.trim()) {
      setPathError('');
      return;
    }
    const validFormat = /^[a-z0-9-]+$/.test(path);
    if (!validFormat) {
      setPathError('Only lowercase letters, numbers and dashes allowed');
      return;
    }
    if (path.length < 2) {
      setPathError('Page path must be at least 2 characters');
      return;
    }
    if (path.length > 50) {
      setPathError('Page path must be less than 50 characters');
      return;
    }
    if (dashboard) {
      // if mode === 'duplicate', always check for duplicates regardless of the id
      const duplicatePath = dashboard.pages.find(p => p.path === path && (mode === 'duplicate' || p.id !== pageId));
      if (duplicatePath) {
        setPathError('A page with this path already exists in this dashboard');
        return;
      }
    }
    setPathError('');
  }, [path, dashboard, pageId, isOpen, mode]);

  const validateForm = useCallback(() => {
    return isOpen && dashboard && name.trim().length > 0 && path.trim().length > 0 && !nameError && !pathError;
  }, [isOpen, dashboard, name, path, nameError, pathError]);

  // No separate real-time aggregate validation needed; individual effects handle errors.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result: DashboardPageWithoutData | undefined;
      if (mode === 'new') {
        result = await createDashboardPage(
          {
            id: dashboardId!,
            name: name.trim(),
            path: path.trim(),
            thumbnail: thumbnail || undefined,
          },
          {
            success: 'Page created successfully',
            error: 'Failed to create page',
          }
        );
      } else if (mode === 'duplicate') {
        result = await duplicateDashboardPage(
          {
            id: dashboardId!,
            pageId: pageId!,
            name: name.trim(),
            path: path.trim(),
            thumbnail: thumbnail || undefined,
          },
          {
            success: 'Page duplicated successfully',
            error: 'Failed to duplicate page',
          }
        );
      } else {
        result = await updateDashboardPageForUser(
          dashboardId!,
          {
            id: pageId!,
            name: name.trim(),
            path: path.trim(),
            thumbnail: thumbnail || undefined,
          },
          {
            success: 'Page updated successfully',
            error: 'Failed to update page',
          }
        );
      }

      // Invalidate query keys needed to reflect the new/updated page
      if (dashboard) {
        if (result) {
          await queryClient.invalidateQueries({
            queryKey: dashboardByPathQueryOptions(dashboard.path).queryKey,
          });
          await queryClient.invalidateQueries({
            queryKey: dashboardsQueryOptions.queryKey,
          });
          await queryClient.invalidateQueries({
            queryKey: dashboardByPathWithPageDataQueryOptions(dashboard.path).queryKey,
          });
          await queryClient.invalidateQueries({
            queryKey: dashboardPageQueryOptions(dashboard.path, result.path).queryKey,
          });
          onSuccess(result);
        } else {
          toast.error('Failed to save page. No result returned from API.');
        }
      } else {
        toast.error('Dashboard not found. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const formTitle = mode === 'new' ? 'Create New Page' : mode === 'duplicate' ? 'Duplicate Page' : 'Edit Page';
  const isInvalid = !validateForm();

  const isTouchedAndEmpty = pathTouched && path.trim() === '';
  const errorHelperText = isTouchedAndEmpty ? 'Page path is required' : pathError;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={<>{formTitle}</>}
      description={
        dashboard && <span style={{ fontSize: '0.875rem', color: 'var(--clr-text-a10)' }}> in dashboard &quot;{dashboard.name}&quot;</span>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <InputField
          label='Page Name *'
          id='page-name'
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Enter page name'
          error={!!nameError}
          helperText={nameError || 'The name of the page.'}
          required
          disabled={isSubmitting}
          autoFocus
        />

        <InputField
          id='page-path'
          value={path}
          onChange={e => {
            setPath(e.target.value);
            setPathTouched(true);
          }}
          label='Page Path *'
          required
          placeholder='page-name'
          error={!!pathError || isTouchedAndEmpty}
          helperText={errorHelperText || 'The path is automatically generated from the page name'}
          disabled={isSubmitting}
          valuePrefix={dashboard && <>{dashboard.path}/</>}
        />

        <ImageField
          id='page-thumbnail'
          label='Thumbnail (optional)'
          helperText='Upload an image thumbnail for this page.'
          value={thumbnail}
          onChange={setThumbnail}
        />

        <div className={styles.formActions}>
          <SecondaryButton
            aria-label=''
            buttonProps={{
              type: 'button',
            }}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <XIcon size={16} />
            Cancel
          </SecondaryButton>
          <PrimaryButton
            aria-label=''
            buttonProps={{
              type: 'submit',
            }}
            loading={isSubmitting}
            disabled={isInvalid}
          >
            {!isInvalid && <CheckIcon size={16} />}
            {mode === 'new' ? 'Create Page' : mode === 'duplicate' ? 'Duplicate Page' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
