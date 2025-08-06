import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ImageUp, X } from 'lucide-react';
import { Alert, PreloadImage } from '@hakit/components';
import { Confirm } from '@components/Modal/confirm';
import { deleteFile, uploadImage } from '@services/upload';
import { Spinner } from '@components/Spinner';
import { IconButton } from '@components/Button/IconButton';

const Container = styled.div`
  padding-top: var(--space-1);
  padding-bottom: var(--space-4);
  width: 100%;
`;

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
  color: var(--color-text-primary);
`;

const PreviewBox = styled.div`
  position: relative;
  margin-top: var(--space-2);
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
  gap: var(--space-1);
  margin-left: var(--space-1);
  > span {
    font-size: var(--font-size-xs);
    padding-left: var(--space-1);
    color: var(--color-text-secondary);
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
  border-radius: var(--radius-md);
`;

const RemoveButton = styled(IconButton)`
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  &:hover {
    background-color: var(--color-gray-700);
    border-color: var(--color-gray-600);
  }
`;

const FileUploadBox = styled.div`
  border: 1px dashed var(--color-primary-400);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  min-height: 100px;
  position: relative;
  overflow: hidden;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-sm);
  transition: var(--transition-normal);
  transition-property: border-color, background-color;

  &:hover {
    border-color: var(--color-primary-300);
    background-color: var(--color-gray-800);
  }

  span {
    &.link {
      cursor: pointer;
      font-weight: var(--font-weight-semibold);
      text-decoration: underline;
      color: var(--color-primary-400);

      &:hover {
        color: var(--color-primary-300);
      }
    }
  }
`;

interface ImageUploadProps {
  value: string;
  id: string;
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

export function ImageUpload({ value, id, onChange }: ImageUploadProps) {
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
      const fileUrl = value;
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
              setLoading(false);
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => {
          console.error('Error:', e);
          setError('Error loading image');
          setLoading(false);
        });
    }
  }, [value, file]);

  useEffect(() => {
    if (file && file.fileimage) {
      setLoading(false);
    }
  }, [file]);

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);
    uploadImage(e.target.files)
      .then(response => {
        if (response && typeof response.filePath === 'string') {
          onChange(response.filePath);
        }
      })
      .catch(e => {
        console.error('Error:', e);
        setError('Error uploading image');
      })
      .finally(() => {
        // TODO - Loading state?
        setLoading(false);
      });
  };

  return (
    <Container>
      <Confirm
        title='Are you sure'
        open={confirmDelete}
        onConfirm={() => {
          setConfirmDelete(false);
          setLoading(true);
          deleteFile(value).finally(() => {
            setLoading(false);
            setFile(null);
            setError(null);
            onChange('');
          });
        }}
        onCancel={() => {
          setConfirmDelete(false);
        }}
      >
        <p>Are you sure you want to remove this image?</p>
      </Confirm>
      {loading ? (
        <FileUploadBox>
          <Spinner />
        </FileUploadBox>
      ) : file && file.fileimage ? (
        <PreviewBox>
          <RemoveButton
            onClick={() => {
              setConfirmDelete(true);
            }}
            variant='transparent'
            aria-label='Remove image'
            size='xs'
            icon={<X size={16} />}
          />
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
          <FileInput id={id} disabled={loading} type='file' onChange={_onChange} accept='image/*' />
          <ImageUp size={48} />
          <span>
            Drag & drop your image here, or <span className='link'>choose your file</span>
          </span>
        </FileUploadBox>
      )}
      {error && <ErrorMessage type='error'>{error}</ErrorMessage>}
    </Container>
  );
}
