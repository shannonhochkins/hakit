import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, updateDashboardForUser, duplicateDashboard } from '@services/dashboard';
import { nameToPath } from '@helpers/editor/routes/nameToPath';
import { usePrevious } from '@hooks/usePrevious';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { InputField } from '@components/Form/Field/Input';
import { ImageField } from '@components/Form/Field/Image';
import { Modal } from '@components/Modal';
import styles from './DashboardForm.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('DashboardForm', styles);

// React Component
interface DashboardFormProps {
  mode: 'new' | 'edit' | 'duplicate';
  dashboardId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DashboardForm({ mode, dashboardId, isOpen, onClose, onSuccess }: DashboardFormProps) {
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);

  const [name, setName] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousName = usePrevious(name);
  const currentDashboard = useMemo(() => dashboards?.find(d => d.id === dashboardId), [dashboards, dashboardId]);

  const isTouchedAndEmpty = pathTouched && path.trim() === '';
  const errorHelperText = isTouchedAndEmpty ? 'Dashboard path is required' : pathError;

  // Auto-generate path from name
  useEffect(() => {
    if (previousName !== name && !pathTouched) {
      setPath(nameToPath(name));
    }
  }, [name, path, pathTouched, previousName]);

  // Path validation
  useEffect(() => {
    if (path.length === 0) {
      setPathError('');
      return;
    }

    // Format validation
    const valid = /^[a-z0-9-]+$/.test(path);
    if (!valid) {
      setPathError('Only lowercase letters, numbers and dashes allowed');
      return;
    }

    // Uniqueness validation
    if (dashboards) {
      const existingDashboard = dashboards.find(d => d.path === path && d.id !== dashboardId);
      if (existingDashboard) {
        setPathError('A dashboard with this path already exists');
        return;
      }
    }

    setPathError('');
  }, [path, dashboards, dashboardId]);

  // Name validation
  useEffect(() => {
    if (name.length === 0) {
      setNameError('');
    } else if (name.length < 2) {
      setNameError('Name must be at least 2 characters');
    } else if (name.length > 50) {
      setNameError('Name must be less than 50 characters');
    } else {
      setNameError('');
    }
  }, [name]);

  // Initialize form when dashboard changes
  useEffect(() => {
    if (mode === 'edit' && currentDashboard) {
      setName(currentDashboard.name);
      setPath(currentDashboard.path);
      setThumbnail(currentDashboard.thumbnail);
      setPathTouched(false);
    } else if (mode === 'duplicate' && currentDashboard) {
      setName(`${currentDashboard.name} (Copy)`);
      setPath(`${currentDashboard.path}-copy`);
      setThumbnail(currentDashboard.thumbnail);
      setPathTouched(true);
    } else if (mode === 'new') {
      setName('');
      setPath('');
      setThumbnail(null);
      setPathTouched(false);
    }
  }, [mode, currentDashboard]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPath('');
      setThumbnail(null);
      setPathTouched(false);
      setPathError('');
      setNameError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = useCallback(() => {
    return !nameError && !pathError && name.length > 0 && path.length > 0;
  }, [nameError, pathError, name, path]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm() || isSubmitting) return;

      setIsSubmitting(true);

      try {
        if (mode === 'new') {
          await createDashboard(
            {
              name,
              path,
              thumbnail,
            },
            {
              success: 'Dashboard created successfully',
              error: 'Failed to create dashboard',
            }
          );
        } else if (mode === 'duplicate' && dashboardId) {
          await duplicateDashboard(
            {
              id: dashboardId,
              name,
              path,
              thumbnail,
            },
            {
              success: 'Dashboard duplicated successfully',
              error: 'Failed to duplicate dashboard',
            }
          );
        } else if (mode === 'edit' && dashboardId && currentDashboard) {
          await updateDashboardForUser(
            {
              id: dashboardId,
              name,
              path,
              data: currentDashboard.data,
              thumbnail: thumbnail,
            },
            {
              success: 'Dashboard updated successfully',
              error: 'Failed to update dashboard',
            }
          );
        }

        dashboardsQuery.refetch();
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error('Error saving dashboard:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, name, path, thumbnail, dashboardId, currentDashboard, validateForm, isSubmitting, dashboardsQuery, onSuccess, onClose]
  );

  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'new':
        return 'Create New Dashboard';
      case 'edit':
        return 'Edit Dashboard';
      case 'duplicate':
        return 'Duplicate Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getSubmitLabel = () => {
    switch (mode) {
      case 'new':
        return 'Create Dashboard';
      case 'edit':
        return 'Save Changes';
      case 'duplicate':
        return 'Duplicate Dashboard';
      default:
        return 'Save';
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={getTitle()}>
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
          label='Dashboard Name *'
          id='dashboard-name'
          type='text'
          value={name}
          required
          onChange={e => setName(e.target.value)}
          placeholder='The name of the dashboard.'
          error={!!nameError}
          helperText={nameError}
        />

        <InputField
          id='dashboard-path'
          label='Dashboard Path *'
          type='text'
          value={path}
          required
          onChange={e => {
            setPath(e.target.value);
            setPathTouched(true);
          }}
          placeholder='The path is used to identify the dashboard in the URL.'
          error={!!pathError || isTouchedAndEmpty}
          helperText={errorHelperText || 'The path is automatically generated from the dashboard name'}
        />

        <ImageField
          id='dashboard-thumbnail'
          label='Thumbnail (optional)'
          value={thumbnail || ''}
          onChange={setThumbnail}
          helperText='Upload an image thumbnail for this dashboard.'
        />

        <div className={getClassName('actions')}>
          <SecondaryButton aria-label='Cancel' type='button' onClick={onClose}>
            <XIcon size={16} />
            Cancel
          </SecondaryButton>
          <PrimaryButton aria-label='Create Dashboard' type='submit' disabled={!validateForm() || isSubmitting} loading={isSubmitting}>
            {validateForm() ? <CheckIcon size={16} /> : null}
            {getSubmitLabel()}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
