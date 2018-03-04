const editCandidatesByMatrixInfo = (tableOfCandidates, matrix) => {
    let indexForRemoving;

    matrix.forEach((row, rowIndex) => {
        row.forEach((digit, columnIndex) => {
            if (digit) {
                tableOfCandidates.rows[rowIndex][columnIndex].length = 0;

                tableOfCandidates.rows[rowIndex].forEach(candidates => {
                    indexForRemoving = candidates.indexOf(digit);

                    if (indexForRemoving >= 0) {
                        candidates.splice(indexForRemoving, 1);
                    }
                });

                tableOfCandidates.columns[columnIndex].forEach(candidates => {
                    indexForRemoving = candidates.indexOf(digit);

                    if (indexForRemoving >= 0) {
                        candidates.splice(indexForRemoving, 1);
                    }
                });

                tableOfCandidates.blocks.rows[Math.trunc(rowIndex / 3)][
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
};

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

    editCandidatesByMatrixInfo(newTableOfCandidates, matrix);

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

const searchForOpenTriplets = (tableOfCandidates, matrix, combinations) => {
    const foundDigits = new Set();
    const bufferForCandidates = [];
    let bufferForBlockFields = [];
    let profit = false;
    let indexForRemoving;

    tableOfCandidates.rows.forEach((row, rowIndex) => {
        combinations.threeFields.forEach(combination => {
            bufferForCandidates.length = 0;
            foundDigits.clear();

            combination.every(candidatesIndex => {
                if (row[candidatesIndex].length) {
                    bufferForCandidates.push(row[candidatesIndex]);
                    return true;
                }
                return false;
            });

            if (bufferForCandidates.length === 3) {
                bufferForCandidates.forEach(candidates => {
                    candidates.forEach(digit => {
                        foundDigits.add(digit);
                    });
                });

                if (foundDigits.size === 3) {
                    foundDigits.forEach(digit => {
                        row.forEach(candidates => {
                            if (!bufferForCandidates.includes(candidates)) {
                                indexForRemoving = candidates.indexOf(digit);

                                if (indexForRemoving >= 0) {
                                    profit = true;
                                    candidates.splice(indexForRemoving, 1);
                                }
                            }
                        });
                    });
                }
            }
        });
    });

    tableOfCandidates.columns.forEach((column, columnIndex) => {
        combinations.threeFields.forEach(combination => {
            bufferForCandidates.length = 0;
            foundDigits.clear();

            combination.every(candidatesIndex => {
                if (column[candidatesIndex].length) {
                    bufferForCandidates.push(column[candidatesIndex]);
                    return true;
                }
                return false;
            });

            if (bufferForCandidates.length === 3) {
                bufferForCandidates.forEach(candidates => {
                    candidates.forEach(digit => {
                        foundDigits.add(digit);
                    });
                });

                if (foundDigits.size === 3) {
                    foundDigits.forEach(digit => {
                        column.forEach(candidates => {
                            if (!bufferForCandidates.includes(candidates)) {
                                indexForRemoving = candidates.indexOf(digit);

                                if (indexForRemoving >= 0) {
                                    profit = true;
                                    candidates.splice(indexForRemoving, 1);
                                }
                            }
                        });
                    });
                }
            }
        });
    });

    tableOfCandidates.blocks.rows.forEach((rowOfBlocks, indexOfRowOfBlocks) => {
        rowOfBlocks.forEach((block, indexOfColumnOfBlocks) => {
            bufferForBlockFields = [];
            bufferForBlockFields = block.rows[0]
                .concat(block.rows[1])
                .concat(block.rows[2]);

            combinations.threeFields.forEach(combination => {
                bufferForCandidates.length = 0;
                foundDigits.clear();

                combination.every(candidatesIndex => {
                    if (bufferForBlockFields[candidatesIndex].length) {
                        bufferForCandidates.push(
                            bufferForBlockFields[candidatesIndex]
                        );
                        return true;
                    }
                    return false;
                });

                if (bufferForCandidates.length === 3) {
                    bufferForCandidates.forEach(candidates => {
                        candidates.forEach(digit => {
                            foundDigits.add(digit);
                        });
                    });

                    if (foundDigits.size === 3) {
                        foundDigits.forEach(digit => {
                            bufferForBlockFields.forEach(candidates => {
                                if (!bufferForCandidates.includes(candidates)) {
                                    indexForRemoving = candidates.indexOf(
                                        digit
                                    );

                                    if (indexForRemoving >= 0) {
                                        profit = true;
                                        candidates.splice(indexForRemoving, 1);
                                    }
                                }
                            });
                        });
                    }
                }
            });
        });
    });

    return profit;
};

const searchForOpenQuads = (tableOfCandidates, matrix, combinations) => {
    const foundDigits = new Set();
    const bufferForCandidates = [];
    let bufferForBlockFields = [];
    let profit = false;
    let indexForRemoving;

    tableOfCandidates.rows.forEach((row, rowIndex) => {
        combinations.fourFields.forEach(combination => {
            bufferForCandidates.length = 0;
            foundDigits.clear();

            combination.every(candidatesIndex => {
                if (row[candidatesIndex].length) {
                    bufferForCandidates.push(row[candidatesIndex]);
                    return true;
                }
                return false;
            });

            if (bufferForCandidates.length === 4) {
                bufferForCandidates.forEach(candidates => {
                    candidates.forEach(digit => {
                        foundDigits.add(digit);
                    });
                });

                if (foundDigits.size === 4) {
                    foundDigits.forEach(digit => {
                        row.forEach(candidates => {
                            if (!bufferForCandidates.includes(candidates)) {
                                indexForRemoving = candidates.indexOf(digit);

                                if (indexForRemoving >= 0) {
                                    profit = true;
                                    candidates.splice(indexForRemoving, 1);
                                }
                            }
                        });
                    });
                }
            }
        });
    });

    tableOfCandidates.columns.forEach((column, columnIndex) => {
        combinations.fourFields.forEach(combination => {
            bufferForCandidates.length = 0;
            foundDigits.clear();

            combination.every(candidatesIndex => {
                if (column[candidatesIndex].length) {
                    bufferForCandidates.push(column[candidatesIndex]);
                    return true;
                }
                return false;
            });

            if (bufferForCandidates.length === 4) {
                bufferForCandidates.forEach(candidates => {
                    candidates.forEach(digit => {
                        foundDigits.add(digit);
                    });
                });

                if (foundDigits.size === 4) {
                    foundDigits.forEach(digit => {
                        column.forEach(candidates => {
                            if (!bufferForCandidates.includes(candidates)) {
                                indexForRemoving = candidates.indexOf(digit);

                                if (indexForRemoving >= 0) {
                                    profit = true;
                                    candidates.splice(indexForRemoving, 1);
                                }
                            }
                        });
                    });
                }
            }
        });
    });

    tableOfCandidates.blocks.rows.forEach((rowOfBlocks, indexOfRowOfBlocks) => {
        rowOfBlocks.forEach((block, indexOfColumnOfBlocks) => {
            bufferForBlockFields = [];
            bufferForBlockFields = block.rows[0]
                .concat(block.rows[1])
                .concat(block.rows[2]);

            combinations.fourFields.forEach(combination => {
                bufferForCandidates.length = 0;
                foundDigits.clear();

                combination.every(candidatesIndex => {
                    if (bufferForBlockFields[candidatesIndex].length) {
                        bufferForCandidates.push(
                            bufferForBlockFields[candidatesIndex]
                        );
                        return true;
                    }
                    return false;
                });

                if (bufferForCandidates.length === 4) {
                    bufferForCandidates.forEach(candidates => {
                        candidates.forEach(digit => {
                            foundDigits.add(digit);
                        });
                    });

                    if (foundDigits.size === 4) {
                        foundDigits.forEach(digit => {
                            bufferForBlockFields.forEach(candidates => {
                                if (!bufferForCandidates.includes(candidates)) {
                                    indexForRemoving = candidates.indexOf(
                                        digit
                                    );

                                    if (indexForRemoving >= 0) {
                                        profit = true;
                                        candidates.splice(indexForRemoving, 1);
                                    }
                                }
                            });
                        });
                    }
                }
            });
        });
    });

    return profit;
};

const searchForXWing = (tableOfCandidates, matrix) => {
    const firstLineFields = [];
    let secondLineIndex;
    let profit = false;
    let indexForRemoving;

    for (let digit = 1; digit <= 9; ++digit) {
        for (let firstRowIndex = 0; firstRowIndex <= 7; ++firstRowIndex) {
            firstLineFields.length = 0;
            secondLineIndex = -1;

            tableOfCandidates.rows[firstRowIndex].every(
                (candidates, columnIndex) => {
                    if (candidates.includes(digit)) {
                        if (firstLineFields.length < 2) {
                            firstLineFields.push(columnIndex);
                        } else {
                            firstLineFields.push(columnIndex);
                            return false;
                        }
                    }
                    return true;
                }
            );

            if (firstLineFields.length === 2) {
                for (
                    let secondRowIndex = firstRowIndex + 1;
                    secondRowIndex <= 8;
                    ++secondRowIndex
                ) {
                    secondLineIndex = tableOfCandidates.rows[
                        secondRowIndex
                    ].every((candidates, columnIndex) => {
                        if (
                            columnIndex === firstLineFields[0] ||
                            columnIndex === firstLineFields[1]
                        ) {
                            return candidates.includes(digit);
                        }
                        return !candidates.includes(digit);
                    })
                        ? secondRowIndex
                        : -1;

                    if (secondLineIndex >= 0) {
                        if (
                            Math.trunc(firstLineFields[0] / 3) ===
                            Math.trunc(firstLineFields[1] / 3)
                        ) {
                            if (
                                Math.trunc(firstRowIndex / 3) ===
                                Math.trunc(secondRowIndex / 3)
                            ) {
                                secondLineIndex = -1;
                            }
                        }
                    }

                    if (secondLineIndex >= 0) {
                        break;
                    }
                }
            }

            if (secondLineIndex >= 0) {
                tableOfCandidates.rows.forEach((row, rowIndex) => {
                    if (
                        rowIndex !== firstRowIndex &&
                        rowIndex !== secondLineIndex
                    ) {
                        firstLineFields.forEach(foundIndex => {
                            indexForRemoving = row[foundIndex].indexOf(digit);
                            if (indexForRemoving >= 0) {
                                profit = true;
                                row[foundIndex].splice(indexForRemoving, 1);
                            }
                        });
                    }
                });
            }
        }

        for (
            let firstColumnIndex = 0;
            firstColumnIndex <= 7;
            ++firstColumnIndex
        ) {
            firstLineFields.length = 0;
            secondLineIndex = -1;

            tableOfCandidates.columns[firstColumnIndex].every(
                (candidates, rowIndex) => {
                    if (candidates.includes(digit)) {
                        if (firstLineFields.length < 2) {
                            firstLineFields.push(rowIndex);
                        } else {
                            firstLineFields.push(rowIndex);
                            return false;
                        }
                    }
                    return true;
                }
            );

            if (firstLineFields.length === 2) {
                for (
                    let secondColumnIndex = firstColumnIndex + 1;
                    secondColumnIndex <= 8;
                    ++secondColumnIndex
                ) {
                    secondLineIndex = tableOfCandidates.columns[
                        secondColumnIndex
                    ].every((candidates, rowIndex) => {
                        if (
                            rowIndex === firstLineFields[0] ||
                            rowIndex === firstLineFields[1]
                        ) {
                            return candidates.includes(digit);
                        }
                        return !candidates.includes(digit);
                    })
                        ? secondColumnIndex
                        : -1;

                    if (secondLineIndex >= 0) {
                        if (
                            Math.trunc(firstLineFields[0] / 3) ===
                            Math.trunc(firstLineFields[1] / 3)
                        ) {
                            if (
                                Math.trunc(firstColumnIndex / 3) ===
                                Math.trunc(secondColumnIndex / 3)
                            ) {
                                secondLineIndex = -1;
                            }
                        }
                    }

                    if (secondLineIndex >= 0) {
                        break;
                    }
                }
            }

            if (secondLineIndex >= 0) {
                tableOfCandidates.columns.forEach((column, columnIndex) => {
                    if (
                        columnIndex !== firstColumnIndex &&
                        columnIndex !== secondLineIndex
                    ) {
                        firstLineFields.forEach(foundIndex => {
                            indexForRemoving = column[foundIndex].indexOf(
                                digit
                            );
                            if (indexForRemoving >= 0) {
                                profit = true;
                                column[foundIndex].splice(indexForRemoving, 1);
                            }
                        });
                    }
                });
            }
        }
    }

    return profit;
};

const findPossibleCombinationsForElements = combinations => {
    let combinationBuffer;
    let combinationIndexesBuffer;
    let amountOfFields;

    for (let number = 7; number <= 480; ++number) {
        combinationBuffer = number.toString(2);
        combinationBuffer =
            "0".repeat(9 - combinationBuffer.length) + combinationBuffer;

        amountOfFields = combinationBuffer.match(/1/g).length;
        combinationIndexesBuffer = [];

        if (amountOfFields === 2) {
            [...combinationBuffer].forEach((bit, index) => {
                if (bit === "1") {
                    combinationIndexesBuffer.push(index);
                }
            });
            combinations.twoFields.push(combinationIndexesBuffer);
        } else if (amountOfFields === 3) {
            [...combinationBuffer].forEach((bit, index) => {
                if (bit === "1") {
                    combinationIndexesBuffer.push(index);
                }
            });
            combinations.threeFields.push(combinationIndexesBuffer);
        } else if (amountOfFields === 4) {
            [...combinationBuffer].forEach((bit, index) => {
                if (bit === "1") {
                    combinationIndexesBuffer.push(index);
                }
            });
            combinations.fourFields.push(combinationIndexesBuffer);
        }
    }
};

const getPossibleDigitsForBruteForce = (
    bruteForceRowIndex,
    bruteForceColumnIndex,
    matrix
) => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(digit => {
        for (let rowIndex = 0; rowIndex <= 8; ++rowIndex) {
            if (matrix[rowIndex][bruteForceColumnIndex] === digit) {
                return false;
            }
        }

        for (let columnIndex = 0; columnIndex <= 8; ++columnIndex) {
            if (matrix[bruteForceRowIndex][columnIndex] === digit) {
                return false;
            }
        }

        bruteForceBlockRowIndex = Math.trunc(bruteForceRowIndex / 3) * 3;
        bruteForceBlockColumnIndex = Math.trunc(bruteForceColumnIndex / 3) * 3;

        for (
            let blockRowIndex = bruteForceBlockRowIndex;
            blockRowIndex <= bruteForceBlockRowIndex + 2;
            ++blockRowIndex
        ) {
            for (
                let blockColumnIndex = bruteForceBlockColumnIndex;
                blockColumnIndex <= bruteForceBlockColumnIndex + 2;
                ++blockColumnIndex
            ) {
                if (matrix[blockRowIndex][blockColumnIndex] === digit) {
                    return false;
                }
            }
        }

        return true;
    });
};

module.exports = function solveSudoku(matrix) {
    const tableOfCandidates = createTableOfCandidates(matrix);
    const possibleCombinations = {
        threeFields: [],
        fourFields: [],
        twoFields: []
    };
    let singleCandidatesProfit = true;
    let hiddenSingleCandidatesProfit = true;
    let lockedCandidatesProfit = true;
    let sameCandidatesProfit = true;
    let pointingDigitPairsAndTripletsProfit = true;
    let openTripletsProfit = true;
    let openQuadsProfit = true;
    let xWingProfit = true;
    let bruteForceRowIndex = 0;
    let bruteForceColumnIndex = 0;
    let bruteForceStepBack = false;
    let bruteForceBlockRowIndex;
    let bruteForceBlockColumnIndex;
    let bruteForceNextDigit;

    findPossibleCombinationsForElements(possibleCombinations);

    while (
        singleCandidatesProfit ||
        hiddenSingleCandidatesProfit ||
        lockedCandidatesProfit ||
        sameCandidatesProfit ||
        openTripletsProfit ||
        openQuadsProfit ||
        xWingProfit
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
        openTripletsProfit = searchForOpenTriplets(
            tableOfCandidates,
            matrix,
            possibleCombinations
        );
        openQuadsProfit = searchForOpenQuads(
            tableOfCandidates,
            matrix,
            possibleCombinations
        );
        xWingProfit = searchForXWing(tableOfCandidates, matrix);
    }

    while (bruteForceRowIndex <= 8) {
        if (!bruteForceStepBack) {
            if (
                tableOfCandidates.rows[bruteForceRowIndex][
                    bruteForceColumnIndex
                ].length
            ) {
                bruteForceNextDigit = getPossibleDigitsForBruteForce(
                    bruteForceRowIndex,
                    bruteForceColumnIndex,
                    matrix
                )[0];

                if (bruteForceNextDigit) {
                    matrix[bruteForceRowIndex][
                        bruteForceColumnIndex
                    ] = bruteForceNextDigit;

                    bruteForceStepBack = false;

                    if (bruteForceColumnIndex < 8) {
                        ++bruteForceColumnIndex;
                    } else {
                        bruteForceColumnIndex = 0;
                        ++bruteForceRowIndex;
                    }
                } else {
                    bruteForceStepBack = true;

                    if (bruteForceColumnIndex > 0) {
                        --bruteForceColumnIndex;
                    } else {
                        bruteForceColumnIndex = 8;
                        --bruteForceRowIndex;
                    }
                }
            } else {
                bruteForceStepBack = false;

                if (bruteForceColumnIndex < 8) {
                    ++bruteForceColumnIndex;
                } else {
                    bruteForceColumnIndex = 0;
                    ++bruteForceRowIndex;
                }
            }
        } else {
            if (
                tableOfCandidates.rows[bruteForceRowIndex][
                    bruteForceColumnIndex
                ].length
            ) {
                bruteForceNextDigit = getPossibleDigitsForBruteForce(
                    bruteForceRowIndex,
                    bruteForceColumnIndex,
                    matrix
                ).find(digit => {
                    return (
                        digit >
                        matrix[bruteForceRowIndex][bruteForceColumnIndex]
                    );
                });

                if (bruteForceNextDigit) {
                    matrix[bruteForceRowIndex][
                        bruteForceColumnIndex
                    ] = bruteForceNextDigit;

                    bruteForceStepBack = false;

                    if (bruteForceColumnIndex < 8) {
                        ++bruteForceColumnIndex;
                    } else {
                        bruteForceColumnIndex = 0;
                        ++bruteForceRowIndex;
                    }
                } else {
                    matrix[bruteForceRowIndex][bruteForceColumnIndex] = 0;

                    bruteForceStepBack = true;

                    if (bruteForceColumnIndex > 0) {
                        --bruteForceColumnIndex;
                    } else {
                        bruteForceColumnIndex = 8;
                        --bruteForceRowIndex;
                    }
                }
            } else {
                bruteForceStepBack = true;

                if (bruteForceColumnIndex > 0) {
                    --bruteForceColumnIndex;
                } else {
                    bruteForceColumnIndex = 8;
                    --bruteForceRowIndex;
                }
            }
        }
    }

    return matrix;
};
