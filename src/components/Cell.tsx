import { Input, Box, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';

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
  copyToClipboard: (text: string) => void;
  clipboardRef: React.RefObject<string>;
}

const isTypableKey = (e: React.KeyboardEvent): boolean => {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key.length === 1;
};

const shadowColors: Record<CellState, string> = {
  unselected: '',
  selected: '#4299E1',
  editing: '#48BB78',
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
  copyToClipboard,
  clipboardRef,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const localInputRef = useRef<HTMLInputElement | null>(null);

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

  const selectionSnapshotRef = useRef<string | null>(null);
  const cursorSnapshotRef = useRef<{ start: number; end: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const input = localInputRef.current;
    if (cellState === 'editing' && input) {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      selectionSnapshotRef.current = start !== end ? input.value.slice(start, end) : null;
      cursorSnapshotRef.current = { start, end };
    } else {
      selectionSnapshotRef.current = null;
      cursorSnapshotRef.current = null;
    }
    setMenuPos({ x: e.clientX, y: e.clientY });
    setIsMenuOpen(true);
  }, [cellState]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleAddRowAbove = useCallback(() => { onAddRowAbove(rowIdx); setIsMenuOpen(false); }, [onAddRowAbove, rowIdx]);
  const handleAddRowBelow = useCallback(() => { onAddRowBelow(rowIdx); setIsMenuOpen(false); }, [onAddRowBelow, rowIdx]);
  const handleAddColumnLeft = useCallback(() => { onAddColumnLeft(columnIdx); setIsMenuOpen(false); }, [onAddColumnLeft, columnIdx]);
  const handleAddColumnRight = useCallback(() => { onAddColumnRight(columnIdx); setIsMenuOpen(false); }, [onAddColumnRight, columnIdx]);
  const handleRemoveRow = useCallback(() => { onRemoveRow(rowIdx); setIsMenuOpen(false); }, [onRemoveRow, rowIdx]);
  const handleRemoveColumn = useCallback(() => { onRemoveColumn(columnIdx); setIsMenuOpen(false); }, [onRemoveColumn, columnIdx]);
  const handleCopy = useCallback(() => {
    const textToCopy = selectionSnapshotRef.current ?? value;
    copyToClipboard(textToCopy);
    setIsMenuOpen(false);
  }, [value, copyToClipboard]);
  const handlePaste = useCallback(() => {
    const pasteText = clipboardRef.current;
    if (cursorSnapshotRef.current) {
      const { start, end } = cursorSnapshotRef.current;
      const newValue = value.slice(0, start) + pasteText + value.slice(end);
      onCellChange(rowIdx, columnIdx, newValue);
    } else {
      onCellChange(rowIdx, columnIdx, pasteText);
    }
    setIsMenuOpen(false);
  }, [onCellChange, rowIdx, columnIdx, clipboardRef, value]);

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
      localInputRef.current = el;
      registerRef(rowIdx, columnIdx, el);
    },
    [registerRef, rowIdx, columnIdx],
  );

  const isSelected = cellState !== 'unselected';
  const shadowColor = shadowColors[cellState];

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
        borderColor={isSelected ? 'transparent' : 'inherit'}
        outline={isSelected ? `2px solid ${shadowColor}` : 'none'}
        outlineOffset="-2px"
        _hover={{ borderColor: isSelected ? 'transparent' : undefined }}
        _focus={{
          borderColor: isSelected ? 'transparent' : 'inherit',
          boxShadow: 'none',
          outline: isSelected ? `2px solid ${shadowColor}` : 'none',
          outlineOffset: '-2px',
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
          <MenuItem onClick={handleCopy}>Copy</MenuItem>
          <MenuItem onClick={handlePaste}>Paste</MenuItem>
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
