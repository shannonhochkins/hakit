import { useState, useEffect } from 'react';
import styles from './ImageField.module.css';
import { uploadImage } from '@services/upload';
import { InputField, InputFileProps } from '../Input';
import { PreloadImage } from '@hakit/components';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { Confirm } from '@components/Modal';
import { Tooltip } from '@components/Tooltip';
import { LinearProgress } from '@components/Loaders/LinearProgress';

interface ImageProps extends Omit<InputFileProps, 'onChange' | 'type'> {
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

export const ImageField = ({
  value,
  onChange,
  size = 'medium',
  placeholder = 'Drag & drop your image here, or choose your file',
  className,
  label,
  disabled,
  id,
  icon,
  helperText,
  name,
}: ImageProps) => {
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
          onChange?.(response.filePath);
        }
      })
      .catch(e => {
        console.error('Error:', e);
        setError('Error uploading image');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Confirm
        title='Are you sure'
        open={confirmDelete}
        onConfirm={() => {
          setConfirmDelete(false);
          setFile(null);
          setError(null);
          onChange('');
        }}
        onCancel={() => {
          setConfirmDelete(false);
        }}
      >
        <p>Are you sure you want to remove this image?</p>
      </Confirm>
      <InputField
        id={id}
        type='file'
        accept='image/*'
        name={name}
        value={value}
        label={label}
        icon={icon}
        error={!!error}
        helperText={error ?? helperText}
        disabled={disabled}
        size={size}
        placeholder={placeholder}
        onChange={_onChange}
        className={`${className} ${styles.imageField}`}
        inputStyles={{ opacity: '0', cursor: 'pointer' }}
        middleAdornment={
          <>
            <div className={styles.middleAdornment} style={{ pointerEvents: value ? 'auto' : 'none' }}>
              {value ? (
                <PrimaryButton
                  size='xs'
                  aria-label='Remove image'
                  variant='error'
                  onClick={() => setConfirmDelete(true)}
                  className={styles.deleteButton}
                >
                  Remove
                </PrimaryButton>
              ) : (
                <SecondaryButton size='xs' aria-label='Choose image'>
                  Choose image
                </SecondaryButton>
              )}
              {loading && <LinearProgress thickness='thin' className={styles.linearProgress} variant='indeterminate' rounded={false} />}
            </div>
          </>
        }
        // onClick={() => (disabled ? undefined : setIsOpen(!isOpen))}
        startAdornment={{
          className: value ? styles.startAdornment : '',
          // if we have a value, preload the imge, if we don't, render a simple rounded svg square with a white fill
          content: value ? (
            <Tooltip
              title={
                value ? (
                  <>
                    <img
                      src={value}
                      alt='Image'
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '100px',
                      }}
                    />
                    <div className={styles.stats}>
                      <span>{file?.filesize}</span>
                      <span>{file?.filetype}</span>
                      <span>
                        {file?.resolution.width}x{file?.resolution.height}
                      </span>
                    </div>
                  </>
                ) : null
              }
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <PreloadImage
                className={styles.imagePreview}
                src={value}
                onError={() => {
                  onChange?.('');
                }}
              />
            </Tooltip>
          ) : (
            <div
              className={styles.imagePreview}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)' }}
            />
          ),
        }}
      />
    </>
  );
};
