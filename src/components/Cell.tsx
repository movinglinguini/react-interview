import { Input, Box, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';

interface Props {
  rowIdx: number;
  columnIdx: number;
  value: string;
  onCellChange: (rowIdx: number, columnIdx: number, newValue: string) => void;
  onAddRowAbove: (rowIdx: number) => void;
  onAddRowBelow: (rowIdx: number) => void;
  onAddColumnLeft: (columnIdx: number) => void;
  onAddColumnRight: (columnIdx: number) => void;
  onRemoveRow: (rowIdx: number) => void;
  onRemoveColumn: (columnIdx: number) => void;
}

const Cell: React.FC<Props> = React.memo(({
  rowIdx,
  columnIdx,
  value,
  onCellChange,
  onAddRowAbove,
  onAddRowBelow,
  onAddColumnLeft,
  onAddColumnRight,
  onRemoveRow,
  onRemoveColumn,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const onChangeHandler = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      onCellChange(rowIdx, columnIdx, ev.target.value);
    },
    [onCellChange, rowIdx, columnIdx],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleAddRowAbove = useCallback(() => { onAddRowAbove(rowIdx); setIsMenuOpen(false); }, [onAddRowAbove, rowIdx]);
  const handleAddRowBelow = useCallback(() => { onAddRowBelow(rowIdx); setIsMenuOpen(false); }, [onAddRowBelow, rowIdx]);
  const handleAddColumnLeft = useCallback(() => { onAddColumnLeft(columnIdx); setIsMenuOpen(false); }, [onAddColumnLeft, columnIdx]);
  const handleAddColumnRight = useCallback(() => { onAddColumnRight(columnIdx); setIsMenuOpen(false); }, [onAddColumnRight, columnIdx]);
  const handleRemoveRow = useCallback(() => { onRemoveRow(rowIdx); setIsMenuOpen(false); }, [onRemoveRow, rowIdx]);
  const handleRemoveColumn = useCallback(() => { onRemoveColumn(columnIdx); setIsMenuOpen(false); }, [onRemoveColumn, columnIdx]);

  return (
    <Box position="relative" onContextMenu={handleContextMenu}>
      <Input value={value} borderRadius={0} width="full" onChange={onChangeHandler} />

      <Menu isOpen={isMenuOpen} onClose={closeMenu}>
        <MenuButton
          aria-hidden
          style={{
            position: 'fixed',
            left: menuPos.x,
            top: menuPos.y,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
        <MenuList>
          <MenuItem onClick={handleAddRowAbove}>Add row above</MenuItem>
          <MenuItem onClick={handleAddRowBelow}>Add row below</MenuItem>
          <MenuItem onClick={handleAddColumnLeft}>Add column left</MenuItem>
          <MenuItem onClick={handleAddColumnRight}>Add column right</MenuItem>
          <MenuItem onClick={handleRemoveRow}>Remove row</MenuItem>
          <MenuItem onClick={handleRemoveColumn}>Remove column</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
});

Cell.displayName = 'Cell';

export default Cell;
