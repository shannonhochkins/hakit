import { Row, type RowProps } from "@lib/page/shared/Layout";

export function ModalActions({ children, ...rest }: { children: React.ReactNode } & RowProps) {
  return (
    <Row
      fullWidth
      alignItems='flex-end'
      justifyContent='flex-end'
      style={{
        marginTop: 24,
      }}
      gap="1rem"
      {...rest}
    >
      {children}
    </Row>
  );
}