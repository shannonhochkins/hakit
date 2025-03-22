import { callApi } from '@editor/hooks/useApi';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ImageUp, X } from 'lucide-react';
import { StyledIconButton } from '../../Sidebar/ActionBar/IconButtons';
import { Alert, PreloadImage } from '@hakit/components';
import { Confirm } from '@editor/puck/EditorComponents/Modal/confirm';

const FileInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
`;

const ErrorMessage = styled(Alert)`
  --ha-error-color: var(--error-color);
  --ha-error-color-a1: var(--error-color-alpha);
  color: var(--puck-color-grey-02);
`;

const PreviewBox = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const Stats = styled.div`
  position: absolute;
  left: 100%;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex-direction: column;
  gap: 0.25rem;
  > span {
    font-size: 0.75rem;
    padding-left: var(--puck-space-px);
  }
`;

const PreviewImage = styled(PreloadImage)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  > div {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  border-radius: 0.25rem;
`;

const RemoveButton = styled(StyledIconButton)`
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  background-color: var(--puck-color-grey-11);
  border: 1px solid var(--puck-color-grey-04);
  border-radius: 100%;
`;

const FileUploadBox = styled.div`
  border: 1px dashed var(--puck-color-azure-05);
  background-color: var(--puck-color-grey-12);
  border-radius: 0.25rem;
  min-height: 100px;
  position: relative;
  overflow: hidden;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--puck-color-grey-03);
  font-weight: 400;
  font-size: 15px;
  span {
    &.link {
      cursor: pointer;
      font-weight: bold;
      text-decoration: underline;
    }
  }
`;

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

type File = {
  id: string;
  filename: string;
  filetype: string;
  fileimage: string | ArrayBuffer | null;
  filesize: string;
  resolution: {
    width: number;
    height: number;
  };
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(!!value);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const getFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!value) {
      setFile(null);
    } else if ((!file && value) || (file && file.filename !== value)) {
      const fileUrl = `/assets/${value}`;
      fetch(fileUrl)
        .then(response => {
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const img = new Image();
            img.onload = () => {
              const resolution = {
                width: img.naturalWidth,
                height: img.naturalHeight,
              };
              // Now update your state with all the information
              setFile({
                id: Date.now().toString(),
                filename: value,
                filetype: blob.type,
                fileimage: reader.result,
                filesize: getFileSize(blob.size),
                resolution, // e.g., { width: 1024, height: 768 }
              } satisfies File);
              setError(null);
            };
            img.onerror = e => {
              console.error('Error:', e);
              setError('Saved image no longer exists.');
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => {
          console.error('Error:', e);
          setError('Error loading image');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [value, file]);

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    const [userFile] = e.target.files;
    if (userFile) {
      setLoading(true);
      reader.readAsDataURL(userFile);
      const formData = new FormData();
      formData.append('image', userFile);
      callApi('/api/upload/image', formData)
        .then(response => {
          onChange(response.filename);
        })
        .catch(e => {
          console.error('Error:', e);
          setError('Error uploading image');
        })
        .finally(() => {
          // TODO - Loading state?
          setLoading(false);
        });
    }
  };

  return (
    <>
      <Confirm
        title='Are you sure'
        open={confirmDelete}
        onConfirm={() => {
          setConfirmDelete(false);
          setLoading(true);
          callApi('/api/remove/image', { filename: value })
            .catch(e => {
              console.error('Error:', e);
              setError('Error removing image');
            })
            .finally(() => {
              setLoading(false);
            });
          onChange('');
        }}
        onCancel={() => {
          setConfirmDelete(false);
        }}
      >
        <p>Are you sure you want to remove this image?</p>
      </Confirm>
      {file && file.fileimage ? (
        <PreviewBox>
          <RemoveButton
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            <X size={16} />
          </RemoveButton>
          <PreviewImage
            src={file.fileimage as string}
            onError={() => {
              onChange('');
            }}
          />
          <Stats>
            <span>{file.filesize}</span>
            <span>{file.filetype}</span>
            <span>
              {file.resolution.width}x{file.resolution.height}
            </span>
          </Stats>
        </PreviewBox>
      ) : (
        <FileUploadBox>
          <FileInput disabled={loading} type='file' onChange={_onChange} accept='image/*' />
          <ImageUp size={48} />
          <span>
            Drag & drop your image here, or <span className='link'>choose your file</span>
          </span>
        </FileUploadBox>
      )}
      {error && <ErrorMessage type='error'>{error}</ErrorMessage>}
    </>
  );
}
