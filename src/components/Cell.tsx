import { Input, Box, IconButton } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import React, { useCallback, useState } from 'react';

interface Props {
  rowIdx: number;
  columnIdx: number;
  value: string;
  onCellChange: (rowIdx: number, columnIdx: number, newValue: string) => void;
  onAddRowAbove: (rowIdx: number) => void;
  onAddRowBelow: (rowIdx: number) => void;
  onAddColumnLeft: (columnIdx: number) => void;
  onAddColumnRight: (columnIdx: number) => void;
}

const edgeButtonStyles = {
  size: 'xs' as const,
  variant: 'solid' as const,
  colorScheme: 'blue' as const,
  borderRadius: 'full' as const,
  position: 'absolute' as const,
  zIndex: 10,
  opacity: 0,
  transition: 'opacity 0.15s',
  minWidth: '20px',
  height: '20px',
  width: '20px',
};

const Cell: React.FC<Props> = React.memo(({
  rowIdx,
  columnIdx,
  value,
  onCellChange,
  onAddRowAbove,
  onAddRowBelow,
  onAddColumnLeft,
  onAddColumnRight,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const onChangeHandler = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      onCellChange(rowIdx, columnIdx, ev.target.value);
    },
    [onCellChange, rowIdx, columnIdx],
  );

  const handleAddRowAbove = useCallback(() => onAddRowAbove(rowIdx), [onAddRowAbove, rowIdx]);
  const handleAddRowBelow = useCallback(() => onAddRowBelow(rowIdx), [onAddRowBelow, rowIdx]);
  const handleAddColumnLeft = useCallback(() => onAddColumnLeft(columnIdx), [onAddColumnLeft, columnIdx]);
  const handleAddColumnRight = useCallback(() => onAddColumnRight(columnIdx), [onAddColumnRight, columnIdx]);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Input value={value} borderRadius={0} width="full" onChange={onChangeHandler} />

      {/* Top - add row above */}
      <IconButton
        aria-label="Add row above"
        icon={<AddIcon boxSize="8px" />}
        {...edgeButtonStyles}
        top="-10px"
        left="50%"
        transform="translateX(-50%)"
        opacity={isHovered ? 1 : 0}
        onClick={handleAddRowAbove}
      />

      {/* Bottom - add row below */}
      <IconButton
        aria-label="Add row below"
        icon={<AddIcon boxSize="8px" />}
        {...edgeButtonStyles}
        bottom="-10px"
        left="50%"
        transform="translateX(-50%)"
        opacity={isHovered ? 1 : 0}
        onClick={handleAddRowBelow}
      />

      {/* Left - add column left */}
      <IconButton
        aria-label="Add column left"
        icon={<AddIcon boxSize="8px" />}
        {...edgeButtonStyles}
        left="-10px"
        top="50%"
        transform="translateY(-50%)"
        opacity={isHovered ? 1 : 0}
        onClick={handleAddColumnLeft}
      />

      {/* Right - add column right */}
      <IconButton
        aria-label="Add column right"
        icon={<AddIcon boxSize="8px" />}
        {...edgeButtonStyles}
        right="-10px"
        top="50%"
        transform="translateY(-50%)"
        opacity={isHovered ? 1 : 0}
        onClick={handleAddColumnRight}
      />
    </Box>
  );
});

Cell.displayName = 'Cell';

export default Cell;
