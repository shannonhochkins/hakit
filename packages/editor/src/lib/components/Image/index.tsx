
interface ImageProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'> {
  objectKey: string;
}
export function Image({
  objectKey,
  ...rest
}: ImageProps) {
  return <img src={`/api/asset/${objectKey}`} {...rest} />;
}