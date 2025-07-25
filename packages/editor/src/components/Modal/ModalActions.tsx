import { Row, type RowProps } from '@hakit/components';

export function ModalActions({ children, ...rest }: { children: React.ReactNode } & RowProps) {
  return (
    <Row
      fullWidth
      alignItems='flex-end'
      justifyContent='flex-end'
      style={{
        marginTop: 24,
      }}
      gap='1rem'
      {...rest}
    >
      {children}
    </Row>
  );
}
