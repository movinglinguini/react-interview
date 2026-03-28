# react-interview

A spreadsheet application built with React, Next.js, TypeScript, and Chakra UI.

## Installation

You can install dependencies using `yarn install` and run the app using `yarn dev`.

## Features

### Cell editing with three interaction states

Each cell has three states:

- **Unselected** -- the default state.
- **Selected** (blue outline) -- click a cell to select it. Arrow keys navigate between cells. Typing a character clears the cell and enters editing mode. Backspace/Delete clears the cell.
- **Editing** (green outline) -- double-click or press Enter on a selected cell to edit it. Left/Right arrows navigate to adjacent cells when the cursor is at the start/end of the input. Up/Down arrows and Enter move to adjacent rows. Escape returns to selected mode.

### Keyboard navigation

- Arrow keys move between cells in selected mode.
- Tab / Shift+Tab move right/left.
- Enter moves down from editing mode.

### Right-click context menu

Right-clicking a cell opens a context menu with the following options:

- Add row above
- Add row below
- Add column left
- Add column right
- Remove row
- Remove column

Removing is prevented when only one row or column remains.

### Row and column headers

Rows and columns display 1-based numeric headers along the left and top edges of the spreadsheet.

### Status toolbar

A toolbar above the spreadsheet displays the currently selected cell's position and value.

### CSV save and load

- **Save as CSV** -- exports the spreadsheet to a `.csv` file, trimming empty trailing rows and columns. Values containing commas, quotes, or newlines are properly escaped.
- **Load CSV** -- imports a `.csv` file into the spreadsheet. If the CSV has fewer than 10 rows or 10 columns, the grid is padded to a 10x10 minimum.
