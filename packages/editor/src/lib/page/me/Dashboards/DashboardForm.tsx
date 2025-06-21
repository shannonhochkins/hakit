import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { CheckIcon, XIcon, ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, updateDashboardForUser } from '@lib/api/dashboard';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { SecondaryButton } from '@lib/page/shared/Button/Secondary';
import { FieldGroup } from '@lib/components/Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '@lib/components/Form/FieldWrapper/FieldLabel';
import { InputField } from '@lib/components/Form/Fields/Input';

// Styled Components
const FormContainer = styled.div`
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
`;

const FormTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--color-text-primary);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const ThumbnailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const ThumbnailPreview = styled.div`
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailPlaceholder = styled.div`
  color: var(--color-text-muted);
`;

const UploadButton = styled.button`
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-normal);
  
  &:hover {
    background-color: var(--color-border);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-2);
`;

// React Component
interface DashboardFormProps {
  mode: 'new' | 'edit' | 'duplicate';
  dashboardId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DashboardForm({ 
  mode, 
  dashboardId, 
  isOpen, 
  onClose, 
  onSuccess 
}: DashboardFormProps) {
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
  const currentDashboard = useMemo(() => 
    dashboards?.find(d => d.id === dashboardId), 
    [dashboards, dashboardId]
  );

  // Auto-generate path from name
  useEffect(() => {
    if (previousName !== name && !pathTouched) {
      setPath(nameToPath(name));
    }
  }, [name, path, pathTouched, previousName]);

  // Path validation
  useEffect(() => {
    const valid = /^[a-z0-9-]+$/.test(path);
    setPathError(valid || path.length === 0 ? '' : 'Only lowercase letters, numbers and dashes allowed');
  }, [path]);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      if (mode === 'new' || mode === 'duplicate') {
        const matchedDashboard = mode === 'duplicate' && currentDashboard ? currentDashboard : {};
        await createDashboard({
          ...matchedDashboard,
          name,
          path,
          thumbnail,
        });
      } else if (mode === 'edit' && dashboardId && currentDashboard) {
        await updateDashboardForUser({
          id: dashboardId,
          name,
          path,
          data: currentDashboard.data,
          thumbnail: thumbnail,
        });
      }

      dashboardsQuery.refetch();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving dashboard:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, name, path, thumbnail, dashboardId, currentDashboard, validateForm, isSubmitting, dashboardsQuery, onSuccess, onClose]);

  const handleThumbnailUpload = useCallback(() => {
    // TODO: Implement thumbnail upload logic
    console.log('Upload thumbnail clicked');
  }, []);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'new': return 'Create New Dashboard';
      case 'edit': return 'Edit Dashboard';
      case 'duplicate': return 'Duplicate Dashboard';
      default: return 'Dashboard';
    }
  };

  const getSubmitLabel = () => {
    switch (mode) {
      case 'new': return 'Create Dashboard';
      case 'edit': return 'Save Changes';
      case 'duplicate': return 'Duplicate Dashboard';
      default: return 'Save';
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>{getTitle()}</FormTitle>
        <CloseButton onClick={onClose} aria-label="Close form">
          <XIcon size={20} />
        </CloseButton>
      </FormHeader>
      
      <Form onSubmit={handleSubmit}>
        <FieldGroup>
          <InputField
            id="dashboard-name"
            label="Dashboard Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Home Dashboard"
            error={!!nameError}
            helperText={nameError}
            fullWidth
          />
        </FieldGroup>

        <FieldGroup>
          <InputField
            id="dashboard-path"
            label="Path"
            type="text"
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setPathTouched(true);
            }}
            placeholder="/home-dashboard"
            error={!!pathError}
            helperText={pathError}
            fullWidth
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel label="Thumbnail (optional)" />
          <ThumbnailContainer>
            <ThumbnailPreview>
              {thumbnail ? (
                <img src={thumbnail} alt="Dashboard thumbnail" />
              ) : (
                <ThumbnailPlaceholder>
                  <ImageIcon size={24} />
                </ThumbnailPlaceholder>
              )}
            </ThumbnailPreview>
            <UploadButton type="button" onClick={handleThumbnailUpload}>
              Upload Image
            </UploadButton>
          </ThumbnailContainer>
        </FieldGroup>

        <FormActions>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton 
            type="submit" 
            disabled={!validateForm() || isSubmitting}
            loading={isSubmitting}
            startIcon={<CheckIcon size={16} />}
          >
            {getSubmitLabel()}
          </PrimaryButton>
        </FormActions>
      </Form>
    </FormContainer>
  );
}
