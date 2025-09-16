import { FieldTypes } from '@typings/fields';
import { ReactNode } from 'react';
import {
  Hash,
  Type,
  Server,
  List,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  Palette,
  Volleyball,
  ExternalLink,
  TableCellsSplit,
  ImagePlus,
  CodeXml,
  Minus,
} from 'lucide-react';

// Create an object with keys based on the extracted type values
export const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  slot: null,
  text: <Type size={16} />,
  imageUpload: <ImagePlus size={16} />,
  number: <Hash size={16} />,
  page: <ExternalLink size={16} />,
  pages: <ExternalLink size={16} />,
  array: <List size={16} />,
  object: <MoreVertical size={16} />,
  entity: <Server size={16} />,
  select: <ChevronDown size={16} />,
  service: <Volleyball size={16} />,
  radio: <CheckCircle size={16} />,
  textarea: <Type size={16} />,
  custom: <MoreVertical size={16} />,
  color: <Palette size={16} />,
  slider: <Hash size={16} />,
  grid: <TableCellsSplit size={16} />,
  code: <CodeXml size={16} />,
  divider: <Minus size={16} />,
  switch: <CheckCircle size={16} />,
  // not seen anyway
  hidden: <Hash size={16} />,
};
