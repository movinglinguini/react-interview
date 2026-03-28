import { Input, Box, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';

type CellState = 'unselected' | 'selected' | 'editing';

interface Props {
  rowIdx: number;
  columnIdx: number;
  value: string;
  cellState: CellState;
  onCellChange: (rowIdx: number, columnIdx: number, newValue: string) => void;
  onSelect: (rowIdx: number, columnIdx: number) => void;
  onStartEditing: (rowIdx: number, columnIdx: number) => void;
  onStopEditing: () => void;
  onNavigate: (rowIdx: number, columnIdx: number, direction: 'up' | 'down' | 'left' | 'right') => void;
  onDeselect: () => void;
  onAddRowAbove: (rowIdx: number) => void;
  onAddRowBelow: (rowIdx: number) => void;
  onAddColumnLeft: (columnIdx: number) => void;
  onAddColumnRight: (columnIdx: number) => void;
  onRemoveRow: (rowIdx: number) => void;
  onRemoveColumn: (columnIdx: number) => void;
  registerRef: (rowIdx: number, columnIdx: number, el: HTMLInputElement | null) => void;
}

const isTypableKey = (e: React.KeyboardEvent): boolean => {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key.length === 1;
};

const borderColors: Record<CellState, string> = {
  unselected: 'inherit',
  selected: 'blue.400',
  editing: 'green.400',
};

const Cell: React.FC<Props> = React.memo(({
  rowIdx,
  columnIdx,
  value,
  cellState,
  onCellChange,
  onSelect,
  onStartEditing,
  onStopEditing,
  onNavigate,
  onDeselect,
  onAddRowAbove,
  onAddRowBelow,
  onAddColumnLeft,
  onAddColumnRight,
  onRemoveRow,
  onRemoveColumn,
  registerRef,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const onChangeHandler = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      onCellChange(rowIdx, columnIdx, ev.target.value);
    },
    [onCellChange, rowIdx, columnIdx],
  );

  const handleClick = useCallback(() => {
    if (cellState === 'unselected') {
      onSelect(rowIdx, columnIdx);
    }
  }, [cellState, onSelect, rowIdx, columnIdx]);

  const handleDoubleClick = useCallback(() => {
    onStartEditing(rowIdx, columnIdx);
  }, [onStartEditing, rowIdx, columnIdx]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (cellState === 'selected') {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'up');
          return;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'down');
          return;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'left');
          return;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'right');
          return;
        case 'Enter':
          e.preventDefault();
          onStartEditing(rowIdx, columnIdx);
          return;
        case 'Escape':
          e.preventDefault();
          onDeselect();
          return;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          onCellChange(rowIdx, columnIdx, '');
          return;
        default:
          if (isTypableKey(e)) {
            e.preventDefault();
            onCellChange(rowIdx, columnIdx, e.key);
            onStartEditing(rowIdx, columnIdx);
          }
          return;
      }
    }

    if (cellState === 'editing') {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd, value: val } = input;
      const atStart = selectionStart === 0 && selectionEnd === 0;
      const atEnd = selectionStart === val.length && selectionEnd === val.length;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'up');
          return;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'down');
          return;
        case 'ArrowLeft':
          if (atStart) {
            e.preventDefault();
            onNavigate(rowIdx, columnIdx, 'left');
          }
          return;
        case 'ArrowRight':
          if (atEnd) {
            e.preventDefault();
            onNavigate(rowIdx, columnIdx, 'right');
          }
          return;
        case 'Enter':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, 'down');
          return;
        case 'Escape':
          e.preventDefault();
          onStopEditing();
          return;
        case 'Tab':
          e.preventDefault();
          onNavigate(rowIdx, columnIdx, e.shiftKey ? 'left' : 'right');
          return;
      }
    }
  }, [cellState, onNavigate, onStartEditing, onStopEditing, onDeselect, onCellChange, rowIdx, columnIdx]);

  const inputRef = useCallback(
    (el: HTMLInputElement | null) => {
      registerRef(rowIdx, columnIdx, el);
    },
    [registerRef, rowIdx, columnIdx],
  );

  const isSelected = cellState !== 'unselected';
  const borderColor = borderColors[cellState];

  return (
    <Box position="relative" onContextMenu={handleContextMenu}>
      <Input
        ref={inputRef}
        value={value}
        borderRadius={0}
        width="full"
        onChange={onChangeHandler}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        readOnly={cellState !== 'editing'}
        cursor={cellState === 'editing' ? 'text' : 'default'}
        borderColor={borderColor}
        borderWidth={isSelected ? '2px' : '1px'}
        boxShadow={isSelected ? `0 0 0 1px var(--chakra-colors-${borderColor.replace('.', '-')})` : 'none'}
        _hover={{ borderColor: isSelected ? borderColor : undefined }}
        _focus={{
          borderColor,
          boxShadow: isSelected ? `0 0 0 1px var(--chakra-colors-${borderColor.replace('.', '-')})` : 'none',
        }}
      />

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
