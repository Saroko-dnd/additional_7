const createTableOfCandidates = matrix => {
    let newTableOfCandidates = {
        blocks: { rows: [[], [], []], columns: [[], [], []] },
        rows: [[], [], [], [], [], [], [], [], []],
        columns: [[], [], [], [], [], [], [], [], []]
    };
    let buffer;
    let blockElementRow;
    let indexForRemoving;

    for (let rowIndex = 0; rowIndex <= 8; ++rowIndex) {
        for (let columnIndex = 0; columnIndex <= 8; ++columnIndex) {
            buffer = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            newTableOfCandidates.rows[rowIndex].push(buffer);
            newTableOfCandidates.columns[columnIndex].push(buffer);
        }
    }

    for (let blockRowIndex = 0; blockRowIndex <= 2; ++blockRowIndex) {
        for (
            let blockColumnIndex = 0;
            blockColumnIndex <= 2;
            ++blockColumnIndex
        ) {
            buffer = { rows: [[], [], []], columns: [[], [], []] };
            blockElementRow = 0;

            for (
                let candidatesRow = 0 + blockRowIndex * 3;
                candidatesRow <= 0 + blockRowIndex * 3 + 2;
                ++candidatesRow
            ) {
                buffer.rows[blockElementRow] = newTableOfCandidates.rows[
                    candidatesRow
                ].slice(0 + blockColumnIndex * 3, 0 + blockColumnIndex * 3 + 3);
                buffer.rows[blockElementRow].forEach((element, index) => {
                    buffer.columns[index].push(element);
                });
                ++blockElementRow;
            }

            newTableOfCandidates.blocks.rows[blockRowIndex].push(buffer);
            newTableOfCandidates.blocks.columns[blockColumnIndex].push(buffer);
        }
    }

    matrix.forEach((row, rowIndex) => {
        row.forEach((digit, columnIndex) => {
            if (digit) {
                newTableOfCandidates.rows[rowIndex][columnIndex].length = 0;

                newTableOfCandidates.rows[rowIndex].forEach(candidates => {
                    indexForRemoving = candidates.indexOf(digit);

                    if (indexForRemoving >= 0) {
                        candidates.splice(indexForRemoving, 1);
                    }
                });

                newTableOfCandidates.columns[columnIndex].forEach(
                    candidates => {
                        indexForRemoving = candidates.indexOf(digit);

                        if (indexForRemoving >= 0) {
                            candidates.splice(indexForRemoving, 1);
                        }
                    }
                );

                newTableOfCandidates.blocks.rows[Math.trunc(rowIndex / 3)][
                    Math.trunc(columnIndex / 3)
                ].rows.forEach(blockRow => {
                    blockRow.forEach(candidates => {
                        indexForRemoving = candidates.indexOf(digit);

                        if (indexForRemoving >= 0) {
                            candidates.splice(indexForRemoving, 1);
                        }
                    });
                });
            }
        });
    });

    return newTableOfCandidates;
};

const insertSingleCandidates = (tableOfCandidates, matrix) => {
    let profit = false;
    let indexForRemoving;

    tableOfCandidates.rows.forEach((row, rowIndex) => {
        row.forEach((candidates, columnIndex) => {
            if (candidates.length === 1) {
                profit = true;
                matrix[rowIndex][columnIndex] = candidates.pop();

                row.forEach(allowedDigits => {
                    indexForRemoving = allowedDigits.indexOf(
                        matrix[rowIndex][columnIndex]
                    );

                    if (indexForRemoving >= 0) {
                        allowedDigits.splice(indexForRemoving, 1);
                    }
                });

                tableOfCandidates.columns[columnIndex].forEach(
                    allowedDigits => {
                        indexForRemoving = allowedDigits.indexOf(
                            matrix[rowIndex][columnIndex]
                        );

                        if (indexForRemoving >= 0) {
                            allowedDigits.splice(indexForRemoving, 1);
                        }
                    }
                );

                tableOfCandidates.blocks.rows[Math.trunc(rowIndex / 3)][
                    Math.trunc(columnIndex / 3)
                ].rows.forEach(blockRow => {
                    blockRow.forEach(allowedDigits => {
                        indexForRemoving = allowedDigits.indexOf(
                            matrix[rowIndex][columnIndex]
                        );

                        if (indexForRemoving >= 0) {
                            allowedDigits.splice(indexForRemoving, 1);
                        }
                    });
                });
            }
        });
    });

    return profit;
};

const searchForHiddenSingleCandidates = (tableOfCandidates, matrix) => {
    let profit = false;
    let indexForRemoving;
    let foundHiddenSingleCandidate = false;

    tableOfCandidates.rows.forEach((row, rowIndex) => {
        row.forEach((candidates, columnIndex) => {
            candidates.some(digit => {
                foundHiddenSingleCandidate = !row.some(allowedDigits => {
                    if (
                        allowedDigits !== candidates &&
                        allowedDigits.includes(digit)
                    ) {
                        return true;
                    }
                    return false;
                });

                if (!foundHiddenSingleCandidate) {
                    foundHiddenSingleCandidate = !tableOfCandidates.columns[
                        columnIndex
                    ].some(allowedDigits => {
                        if (
                            allowedDigits !== candidates &&
                            allowedDigits.includes(digit)
                        ) {
                            return true;
                        }
                        return false;
                    });
                }

                if (!foundHiddenSingleCandidate) {
                    foundHiddenSingleCandidate = !tableOfCandidates.blocks.rows[
                        Math.trunc(rowIndex / 3)
                    ][Math.trunc(columnIndex / 3)].rows.some(blockRow => {
                        return blockRow.some(allowedDigits => {
                            if (
                                allowedDigits !== candidates &&
                                allowedDigits.includes(digit)
                            ) {
                                return true;
                            }
                            return false;
                        });
                    });
                }

                if (foundHiddenSingleCandidate) {
                    profit = true;
                    candidates.length = 0;
                    candidates.push(digit);
                }

                return foundHiddenSingleCandidate;
            });

            if (profit) {
                insertSingleCandidates(tableOfCandidates, matrix);
            }
        });
    });

    return profit;
};

const searchForLockedCandidates = (tableOfCandidates, matrix) => {
    let foundLockedCandidates = false;
    let indexForRemoving;
    let profit = false;

    tableOfCandidates.blocks.rows.forEach((blocksRow, blockRowIndex) => {
        blocksRow.forEach((block, blockColumnIndex) => {
            block.rows.forEach((row, rowIndex) => {
                row.forEach((candidates, columnIndex) => {
                    candidates.forEach(digit => {
                        foundLockedCandidates = !block.rows.some(foundRow => {
                            if (foundRow !== row) {
                                return foundRow.some(allowedDigits => {
                                    return allowedDigits.includes(digit);
                                });
                            }
                            return false;
                        });

                        if (foundLockedCandidates) {
                            tableOfCandidates.rows[
                                blockRowIndex * 3 + rowIndex
                            ].forEach(allowedDigits => {
                                if (!row.includes(allowedDigits)) {
                                    indexForRemoving = allowedDigits.indexOf(
                                        digit
                                    );

                                    if (indexForRemoving >= 0) {
                                        profit = true;
                                        allowedDigits.splice(
                                            indexForRemoving,
                                            1
                                        );
                                    }
                                }
                            });
                        } else {
                            foundLockedCandidates = !block.columns.some(
                                foundColumn => {
                                    if (
                                        foundColumn !==
                                        block.columns[columnIndex]
                                    ) {
                                        return foundColumn.some(
                                            allowedDigits => {
                                                return allowedDigits.includes(
                                                    digit
                                                );
                                            }
                                        );
                                    }
                                    return false;
                                }
                            );

                            if (foundLockedCandidates) {
                                tableOfCandidates.columns[
                                    blockColumnIndex * 3 + columnIndex
                                ].forEach(allowedDigits => {
                                    if (
                                        !block.columns[columnIndex].includes(
                                            allowedDigits
                                        )
                                    ) {
                                        indexForRemoving = allowedDigits.indexOf(
                                            digit
                                        );

                                        if (indexForRemoving >= 0) {
                                            profit = true;
                                            allowedDigits.splice(
                                                indexForRemoving,
                                                1
                                            );
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });
        });
    });

    insertSingleCandidates(tableOfCandidates, matrix);
    return profit;
};

const searchForOpenSameCandidates = (tableOfCandidates, matrix) => {
    let profit = false;
    let bufferForSameCandidates = [];
    let indexForRemoving;

    tableOfCandidates.rows.forEach((row, rowIndex) => {
        row.forEach((candidates, columnIndex) => {
            bufferForSameCandidates = [];
            bufferForSameCandidates.push(candidates);

            row.forEach(allowedDigits => {
                if (allowedDigits !== candidates) {
                    if (
                        allowedDigits.every(
                            (digit, index) => digit === candidates[index]
                        ) &&
                        allowedDigits.length === candidates.length
                    ) {
                        bufferForSameCandidates.push(allowedDigits);
                    }
                }
            });

            if (
                bufferForSameCandidates.length > 1 &&
                bufferForSameCandidates[0].length ===
                    bufferForSameCandidates.length
            ) {
                row.forEach(allowedDigits => {
                    if (!bufferForSameCandidates.includes(allowedDigits)) {
                        bufferForSameCandidates[0].forEach(digit => {
                            indexForRemoving = allowedDigits.indexOf(digit);

                            if (indexForRemoving >= 0) {
                                profit = true;
                                allowedDigits.splice(indexForRemoving, 1);
                            }
                        });
                    }
                });
            }
        });
    });

    tableOfCandidates.columns.forEach((column, columnIndex) => {
        column.forEach((candidates, rowIndex) => {
            bufferForSameCandidates = [];
            bufferForSameCandidates.push(candidates);

            column.forEach(allowedDigits => {
                if (allowedDigits !== candidates) {
                    if (
                        allowedDigits.every(
                            (digit, index) => digit === candidates[index]
                        ) &&
                        allowedDigits.length === candidates.length
                    ) {
                        bufferForSameCandidates.push(allowedDigits);
                    }
                }
            });

            if (
                bufferForSameCandidates.length > 1 &&
                bufferForSameCandidates[0].length ===
                    bufferForSameCandidates.length
            ) {
                column.forEach(allowedDigits => {
                    if (!bufferForSameCandidates.includes(allowedDigits)) {
                        bufferForSameCandidates[0].forEach(digit => {
                            indexForRemoving = allowedDigits.indexOf(digit);

                            if (indexForRemoving >= 0) {
                                profit = true;
                                allowedDigits.splice(indexForRemoving, 1);
                            }
                        });
                    }
                });
            }
        });
    });

    tableOfCandidates.blocks.rows.forEach((blockRow, blockRowIndex) => {
        blockRow.forEach((block, blockColumnIndex) => {
            block.rows.forEach((row, rowIndex) => {
                row.forEach((candidates, columnIndex) => {
                    bufferForSameCandidates = [];
                    bufferForSameCandidates.push(candidates);

                    block.rows.forEach(foundRow => {
                        foundRow.forEach(allowedDigits => {
                            if (allowedDigits !== candidates) {
                                if (
                                    allowedDigits.every(
                                        (digit, index) =>
                                            digit === candidates[index]
                                    ) &&
                                    allowedDigits.length === candidates.length
                                ) {
                                    bufferForSameCandidates.push(allowedDigits);
                                }
                            }
                        });
                    });

                    if (
                        bufferForSameCandidates.length > 1 &&
                        bufferForSameCandidates[0].length ===
                            bufferForSameCandidates.length
                    ) {
                        block.rows.forEach(foundRow => {
                            foundRow.forEach(allowedDigits => {
                                if (
                                    !bufferForSameCandidates.includes(
                                        allowedDigits
                                    )
                                ) {
                                    bufferForSameCandidates[0].forEach(
                                        digit => {
                                            indexForRemoving = allowedDigits.indexOf(
                                                digit
                                            );

                                            if (indexForRemoving >= 0) {
                                                profit = true;
                                                allowedDigits.splice(
                                                    indexForRemoving,
                                                    1
                                                );
                                            }
                                        }
                                    );
                                }
                            });
                        });
                    }
                });
            });
        });
    });

    return profit;
};

module.exports = function solveSudoku(matrix) {
    const tableOfCandidates = createTableOfCandidates(matrix);
    let singleCandidatesProfit = true;
    let hiddenSingleCandidatesProfit = true;
    let lockedCandidatesProfit = true;
    let sameCandidatesProfit = true;
    let candidatesExist = true;

    while (candidatesExist) {
        singleCandidatesProfit = true;
        hiddenSingleCandidatesProfit = true;
        lockedCandidatesProfit = true;
        sameCandidatesProfit = true;
        while (
            singleCandidatesProfit ||
            hiddenSingleCandidatesProfit ||
            lockedCandidatesProfit ||
            sameCandidatesProfit
        ) {
            singleCandidatesProfit = insertSingleCandidates(
                tableOfCandidates,
                matrix
            );
            hiddenSingleCandidatesProfit = searchForHiddenSingleCandidates(
                tableOfCandidates,
                matrix
            );
            lockedCandidatesProfit = searchForLockedCandidates(
                tableOfCandidates,
                matrix
            );
            sameCandidatesProfit = searchForOpenSameCandidates(
                tableOfCandidates,
                matrix
            );
        }

        candidatesExist = tableOfCandidates.rows.some(row => {
            return row.some(candidates => (candidates.length ? true : false));
        });

        if (candidatesExist) {
            tableOfCandidates.rows.some((row, rowIndex) => {
                return row.some((candidates, columnIndex) => {
                    if (candidates[0]) {
                        matrix[rowIndex][columnIndex] = candidates.pop();
                        return true;
                    }
                    return false;
                });
            });
        }
    }

    return matrix;
};
