import { Box, Button, Flex, Center, HStack, Text } from '@chakra-ui/react';
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
  const clipboardRef = useRef<string>('');

  const copyToClipboard = useCallback((text: string) => {
    clipboardRef.current = text;
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

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

  const numColumns = spreadsheetState[0]?.length ?? 0;
  const selectedValue = selectedCell
    ? spreadsheetState[selectedCell.row]?.[selectedCell.col] ?? ''
    : '';

  const saveAsCsv = useCallback(() => {
    const data = spreadsheetState;

    // Find last row with content
    let lastRow = -1;
    let lastCol = -1;
    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < data[r].length; c++) {
        if (data[r][c] !== '') {
          if (r > lastRow) lastRow = r;
          if (c > lastCol) lastCol = c;
        }
      }
    }

    if (lastRow === -1) return; // nothing to save

    const csvRows: string[] = [];
    for (let r = 0; r <= lastRow; r++) {
      const cells: string[] = [];
      for (let c = 0; c <= lastCol; c++) {
        const val = data[r][c];
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          cells.push(`"${val.replace(/"/g, '""')}"`);
        } else {
          cells.push(val);
        }
      }
      csvRows.push(cells.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [spreadsheetState]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCsv = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = text.split('\n').map((line) => {
          const cells: string[] = [];
          let i = 0;
          while (i < line.length) {
            if (line[i] === '"') {
              i++;
              let val = '';
              while (i < line.length) {
                if (line[i] === '"' && line[i + 1] === '"') {
                  val += '"';
                  i += 2;
                } else if (line[i] === '"') {
                  i++;
                  break;
                } else {
                  val += line[i];
                  i++;
                }
              }
              cells.push(val);
              if (line[i] === ',') i++;
            } else {
              const next = line.indexOf(',', i);
              if (next === -1) {
                cells.push(line.slice(i));
                break;
              } else {
                cells.push(line.slice(i, next));
                i = next + 1;
              }
            }
          }
          return cells;
        });

        // Remove trailing empty row from final newline
        if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
          rows.pop();
        }

        const numRows = Math.max(NUM_ROWS, rows.length);
        const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
        const numCols = Math.max(NUM_COLUMNS, maxCols);

        const padded = _.times(numRows, (r) => {
          const row = rows[r] ?? [];
          return _.times(numCols, (c) => row[c] ?? '');
        });

        setSpreadsheetState(padded);
        setSelectedCell(null);
        setIsEditing(false);
      };
      reader.readAsText(file);

      // Reset so the same file can be loaded again
      e.target.value = '';
    },
    [],
  );

  return (
    <Box width="full">
      {/* Status toolbar */}
      <HStack
        padding="2"
        marginBottom="2"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        spacing="4"
        minHeight="40px"
      >
        <HStack spacing="1">
          <Text fontWeight="bold" fontSize="sm">Cell:</Text>
          <Text fontSize="sm">
            {selectedCell
              ? `Row ${selectedCell.row + 1}, Col ${selectedCell.col + 1}`
              : 'None'}
          </Text>
        </HStack>
        <HStack spacing="1">
          <Text fontWeight="bold" fontSize="sm">Value:</Text>
          <Text fontSize="sm">{selectedCell ? selectedValue || '(empty)' : '-'}</Text>
        </HStack>
      </HStack>
      <HStack
        padding="2"
        marginBottom="2"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        spacing="4"
        minHeight="40px"
      >
        <Button size="sm" colorScheme="blue" onClick={saveAsCsv}>
          Save as CSV
        </Button>
        <Button size="sm" colorScheme="green" onClick={loadCsv}>
          Load CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </HStack>

      {/* Column headers */}
      <Flex>
        <Center minWidth="40px" height="40px" bg="gray.100" fontWeight="bold" fontSize="sm" borderWidth="1px" borderColor="gray.200" />
        {_.times(numColumns, (columnIdx) => (
          <Center key={columnIdx} flex="1" height="40px" bg="gray.100" fontWeight="bold" fontSize="sm" borderWidth="1px" borderColor="gray.200">
            {columnIdx + 1}
          </Center>
        ))}
      </Flex>
      {spreadsheetState.map((row, rowIdx) => {
        return (
          <Flex key={String(rowIdx)}>
            {/* Row header */}
            <Center minWidth="40px" height="40px" bg="gray.100" fontWeight="bold" fontSize="sm" borderWidth="1px" borderColor="gray.200">
              {rowIdx + 1}
            </Center>
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
                copyToClipboard={copyToClipboard}
                clipboardRef={clipboardRef}
              />
            ))}
          </Flex>
        );
      })}
    </Box>
  );
};

export default Spreadsheet;
