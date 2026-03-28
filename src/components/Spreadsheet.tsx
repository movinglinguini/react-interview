import { Box, Flex } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';

import Cell from 'components/Cell';

const NUM_ROWS = 10;
const NUM_COLUMNS = 10;

const Spreadsheet: React.FC = () => {
  const [spreadsheetState, setSpreadsheetState] = useState(
    _.times(NUM_ROWS, () => _.times(NUM_COLUMNS, _.constant(''))),
  );

  const numColumns = spreadsheetState[0]?.length ?? 0;

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

  return (
    <Box width="full">
      {spreadsheetState.map((row, rowIdx) => {
        return (
          <Flex key={String(rowIdx)}>
            {row.map((cellValue, columnIdx) => (
              <Cell
                key={`${rowIdx}/${columnIdx}`}
                value={cellValue}
                onChange={(newValue: string) => {
                  const newRow = [
                    ...spreadsheetState[rowIdx].slice(0, columnIdx),
                    newValue,
                    ...spreadsheetState[rowIdx].slice(columnIdx + 1),
                  ];
                  setSpreadsheetState([
                    ...spreadsheetState.slice(0, rowIdx),
                    newRow,
                    ...spreadsheetState.slice(rowIdx + 1),
                  ]);
                }}
                onAddRowAbove={() => addRowAbove(rowIdx)}
                onAddRowBelow={() => addRowBelow(rowIdx)}
                onAddColumnLeft={() => addColumnLeft(columnIdx)}
                onAddColumnRight={() => addColumnRight(columnIdx)}
              />
            ))}
          </Flex>
        );
      })}
    </Box>
  );
};

export default Spreadsheet;
