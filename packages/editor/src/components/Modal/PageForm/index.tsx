import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { CheckIcon, XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardsQueryOptions, createDashboardPage, updateDashboardPageForUser, duplicateDashboardPage } from '@services/dashboard';
import { nameToPath } from '@helpers/editor/routes/nameToPath';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { FieldGroup } from '@components/Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '@components/Form/FieldWrapper/FieldLabel';
import { InputField } from '@components/Form/Fields/Input';
import { ImageUpload } from '@components/Form/Fields/Image';
import { Modal } from '@components/Modal';
import { InputAdornment } from '@mui/material';
import { DashboardPageWithoutData } from '@typings/hono';

// Styled Components
const FormActions = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
`;

const CompactInputAdornment = styled(InputAdornment)`
  .MuiInputAdornment-root {
    margin-right: 0;
  }

  /* Reduce spacing between adornment and input */
  &.MuiInputAdornment-positionStart {
    margin-right: 0;
  }
`;

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);
  const [pathTouched, setPathTouched] = useState(false);

  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = dashboardsQuery.data;
  const dashboard = dashboards?.find(d => d.id === dashboardId);
  const existingPage = dashboard?.pages.find(p => p.id === pageId);

  // Reset form when opening/closing or changing mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && existingPage) {
        setName(existingPage.name);
        setPath(nameToPath(existingPage.name));
        setThumbnail(existingPage.thumbnail || '');
        setPathTouched(false);
      } else if (mode === 'duplicate' && existingPage) {
        setName(`${existingPage.name} (Copy)`);
        setPath('');
        setThumbnail(existingPage.thumbnail || '');
        setPathTouched(false);
      } else {
        setName('');
        setPath('');
        setThumbnail('');
        setPathTouched(false);
      }
      setNameError(null);
      setPathError(null);
    }
  }, [isOpen, mode, existingPage]);

  // Auto-generate path from name when not touched
  useEffect(() => {
    if (!pathTouched && name) {
      setPath(nameToPath(name));
    }
  }, [name, pathTouched]);

  const validateForm = useCallback(() => {
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      setNameError('Page name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Page name must be at least 2 characters');
      isValid = false;
    } else if (name.trim().length > 50) {
      setNameError('Page name must be less than 50 characters');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!dashboard) {
      setNameError('Dashboard not found');
      return false;
    }

    // Check for duplicate page names within the dashboard
    const existingPageWithName = dashboard.pages.find(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== pageId);

    if (existingPageWithName) {
      setNameError('A page with this name already exists in this dashboard');
      isValid = false;
    }

    // Path validation
    if (path.length === 0) {
      setPathError('');
    } else {
      // Format validation
      const valid = /^[a-z0-9-]+$/.test(path);
      if (!valid) {
        setPathError('Only lowercase letters, numbers and dashes allowed');
        isValid = false;
      } else {
        // Check for duplicate paths within the dashboard
        const existingPageWithPath = dashboard.pages.find(p => nameToPath(p.name) === path && p.id !== pageId);

        if (existingPageWithPath) {
          setPathError('A page with this path already exists in this dashboard');
          isValid = false;
        } else {
          setPathError(null);
        }
      }
    }

    return isValid;
  }, [name, path, dashboard, pageId]);

  // Real-time validation
  useEffect(() => {
    if ((name.trim() || path.trim()) && dashboard) {
      validateForm();
    }
  }, [name, path, dashboard, validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

      // Refetch dashboards to update the UI
      dashboardsQuery.refetch();
      onSuccess(result);
    } catch (error) {
      console.error('Error saving page:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const formTitle = mode === 'new' ? 'Create New Page' : mode === 'duplicate' ? 'Duplicate Page' : 'Edit Page';

  const isInvalid = !name.trim() || !path.trim() || !!nameError || !!pathError;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={
        <>
          {formTitle}
          {dashboard && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}> in {dashboard.name}</span>}
        </>
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
        <FieldGroup>
          <FieldLabel htmlFor='page-name' label='Page Name' description='The name of the page.' />
          <InputField
            id='page-name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Enter page name'
            error={!!nameError}
            helperText={nameError}
            required
            disabled={isSubmitting}
            autoFocus
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor='page-path' label='Page Path' description='The path of the page underneath the dashboard.' />
          <InputField
            id='page-path'
            value={path}
            onChange={e => {
              setPath(e.target.value);
              setPathTouched(true);
            }}
            required
            placeholder='page-name'
            error={!!pathError}
            helperText={pathError || 'The path is automatically generated from the page name'}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                style: {
                  paddingLeft: 0,
                  color: 'var(--color-primary)',
                },
              },
              input: {
                startAdornment: dashboard && <CompactInputAdornment position='start'>{dashboard.path}/</CompactInputAdornment>,
              },
            }}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor='page-thumbnail' label='Thumbnail (optional)' description='Upload an image thumbnail for this page.' />
          <ImageUpload id='page-thumbnail' value={thumbnail} onChange={setThumbnail} />
        </FieldGroup>

        <FormActions>
          <SecondaryButton aria-label='' type='button' onClick={handleClose} disabled={isSubmitting}>
            <XIcon size={16} />
            Cancel
          </SecondaryButton>
          <PrimaryButton aria-label='' type='submit' loading={isSubmitting} disabled={isInvalid}>
            {!isInvalid && <CheckIcon size={16} />}
            {mode === 'new' ? 'Create Page' : mode === 'duplicate' ? 'Duplicate Page' : 'Save Changes'}
          </PrimaryButton>
        </FormActions>
      </form>
    </Modal>
  );
}
