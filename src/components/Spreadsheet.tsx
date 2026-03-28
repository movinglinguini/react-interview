import { Box, Flex } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useCallback, useRef, useState } from 'react';

import Cell from 'components/Cell';

const NUM_ROWS = 10;
const NUM_COLUMNS = 10;

type CellCoord = { row: number; col: number } | null;

const Spreadsheet: React.FC = () => {
  const [spreadsheetState, setSpreadsheetState] = useState(
    _.times(NUM_ROWS, () => _.times(NUM_COLUMNS, _.constant(''))),
  );
  const [selectedCell, setSelectedCell] = useState<CellCoord>(null);
  const [isEditing, setIsEditing] = useState(false);

  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const registerCellRef = useCallback(
    (rowIdx: number, columnIdx: number, el: HTMLInputElement | null) => {
      const key = `${rowIdx}/${columnIdx}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  const focusCell = useCallback((row: number, col: number) => {
    const target = cellRefs.current.get(`${row}/${col}`);
    target?.focus();
  }, []);

  const onCellChange = useCallback(
    (rowIdx: number, columnIdx: number, newValue: string) => {
      setSpreadsheetState((prev) => {
        const newRow = [
          ...prev[rowIdx].slice(0, columnIdx),
          newValue,
          ...prev[rowIdx].slice(columnIdx + 1),
        ];
        return [
          ...prev.slice(0, rowIdx),
          newRow,
          ...prev.slice(rowIdx + 1),
        ];
      });
    },
    [],
  );

  const onSelect = useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col });
      setIsEditing(false);
      focusCell(row, col);
    },
    [focusCell],
  );

  const onStartEditing = useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col });
      setIsEditing(true);
      focusCell(row, col);
    },
    [focusCell],
  );

  const onStopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onNavigate = useCallback(
    (rowIdx: number, columnIdx: number, direction: 'up' | 'down' | 'left' | 'right') => {
      let targetRow = rowIdx;
      let targetCol = columnIdx;
      switch (direction) {
        case 'up': targetRow -= 1; break;
        case 'down': targetRow += 1; break;
        case 'left': targetCol -= 1; break;
        case 'right': targetCol += 1; break;
      }
      if (cellRefs.current.has(`${targetRow}/${targetCol}`)) {
        setSelectedCell({ row: targetRow, col: targetCol });
        setIsEditing(false);
        focusCell(targetRow, targetCol);
      }
    },
    [focusCell],
  );

  const onDeselect = useCallback(() => {
    setSelectedCell(null);
    setIsEditing(false);
  }, []);

  const addRowAbove = useCallback(
    (rowIdx: number) => {
      setSpreadsheetState((prev) => [
        ...prev.slice(0, rowIdx),
        _.times(prev[0]?.length ?? 0, _.constant('')),
        ...prev.slice(rowIdx),
      ]);
    },
    [],
  );

  const addRowBelow = useCallback(
    (rowIdx: number) => {
      setSpreadsheetState((prev) => [
        ...prev.slice(0, rowIdx + 1),
        _.times(prev[0]?.length ?? 0, _.constant('')),
        ...prev.slice(rowIdx + 1),
      ]);
    },
    [],
  );

  const addColumnLeft = useCallback(
    (columnIdx: number) => {
      setSpreadsheetState((prev) =>
        prev.map((row) => [
          ...row.slice(0, columnIdx),
          '',
          ...row.slice(columnIdx),
        ]),
      );
    },
    [],
  );

  const addColumnRight = useCallback(
    (columnIdx: number) => {
      setSpreadsheetState((prev) =>
        prev.map((row) => [
          ...row.slice(0, columnIdx + 1),
          '',
          ...row.slice(columnIdx + 1),
        ]),
      );
    },
    [],
  );

  const removeRow = useCallback(
    (rowIdx: number) => {
      setSpreadsheetState((prev) => {
        if (prev.length <= 1) return prev;
        return [...prev.slice(0, rowIdx), ...prev.slice(rowIdx + 1)];
      });
    },
    [],
  );

  const removeColumn = useCallback(
    (columnIdx: number) => {
      setSpreadsheetState((prev) => {
        if ((prev[0]?.length ?? 0) <= 1) return prev;
        return prev.map((row) => [
          ...row.slice(0, columnIdx),
          ...row.slice(columnIdx + 1),
        ]);
      });
    },
    [],
  );

  const getCellState = (rowIdx: number, columnIdx: number): 'unselected' | 'selected' | 'editing' => {
    if (!selectedCell || selectedCell.row !== rowIdx || selectedCell.col !== columnIdx) {
      return 'unselected';
    }
    return isEditing ? 'editing' : 'selected';
  };

  return (
    <Box width="full">
      {spreadsheetState.map((row, rowIdx) => {
        return (
          <Flex key={String(rowIdx)}>
            {row.map((cellValue, columnIdx) => (
              <Cell
                key={`${rowIdx}/${columnIdx}`}
                rowIdx={rowIdx}
                columnIdx={columnIdx}
                value={cellValue}
                cellState={getCellState(rowIdx, columnIdx)}
                onCellChange={onCellChange}
                onSelect={onSelect}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                onNavigate={onNavigate}
                onDeselect={onDeselect}
                onAddRowAbove={addRowAbove}
                onAddRowBelow={addRowBelow}
                onAddColumnLeft={addColumnLeft}
                onAddColumnRight={addColumnRight}
                onRemoveRow={removeRow}
                onRemoveColumn={removeColumn}
                registerRef={registerCellRef}
              />
            ))}
          </Flex>
        );
      })}
    </Box>
  );
};

export default Spreadsheet;
