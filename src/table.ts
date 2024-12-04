import { stderr, stdout } from "node:process";

interface IDisplayTable {
    boldHeading: boolean;
    data: { headers: string[], values: string[][] };
}

export function displayTable({ boldHeading, data }: IDisplayTable) {
    if (data.headers.length !== data.values[0].length) {
        stderr.write("Heading and Value mismatch in table data")
        return
    };

    const columnCount = data.headers.length;
    const terminalWidth = process.stdout.columns - (columnCount + 2) || 75;

    let columnWidths: number[] = [];

    for (let i = 0; i < columnCount; i++) {
        let maxLen = data.headers[i].length;
        for (const row of data.values) {
            maxLen = Math.max(maxLen, row[i].length) + 2;
        }

        columnWidths.push(maxLen);
    }

    columnWidths = adjustColumnWidths(columnWidths, terminalWidth);

    printTableTop(columnWidths, boldHeading);
    printValues(columnWidths, data.headers, boldHeading);
    printSeparator(columnWidths, boldHeading);

    for (const row of data.values) {
        const splitRows = row.map((value, index) => splitString(value, columnWidths[index] - 2));
        const maxRows = Math.max(...splitRows.map(row => row.length));

        for (let i = 0; i < maxRows; i++) {
            const valuesToPrint = splitRows.map(row => row[i] || '');
            printValues(columnWidths, valuesToPrint, false);
        }

        if (row !== data.values.at(-1)) {
            printSeparator(columnWidths, false);
        }
    }

    printTableBottom(columnWidths);
}

function adjustColumnWidths(columnWidths: number[], maxTotal: number): number[] {
    let currentTotal = columnWidths.reduce((acc, num) => acc + num, 0);

    if (currentTotal <= maxTotal) {
        return columnWidths;
    }

    while (currentTotal > maxTotal) {
        let largestIndex = 0;
        for (let i = 1; i < columnWidths.length; i++) {
            if (columnWidths[i] > columnWidths[largestIndex]) {
                largestIndex = i;
            }
        }
        columnWidths[largestIndex] = Math.max(0, columnWidths[largestIndex] - (currentTotal - maxTotal));
        currentTotal = columnWidths.reduce((acc, num) => acc + num, 0);
    }

    return columnWidths;
}

function splitString(string: string, maxLength: number): string[] {
    if (string.length <= maxLength) {
        return [string];
    }

    if (string.includes("/")) {
        const parts = string.split('/');
        const result: string[] = [];
        let currentPart = parts[0];

        for (let i = 1; i < parts.length; i++) {
            const nextPart = '/' + parts[i];
            if (currentPart.length + nextPart.length <= maxLength) {
                currentPart += nextPart;
            } else {
                result.push(currentPart);
                currentPart = nextPart;
            }
        }

        if (currentPart) {
            result.push(currentPart);
        }

        return result;
    }

    const result: string[] = [];
    let currentChunk = '';

    for (const element of string) {
        if (currentChunk.length + 1 <= maxLength) {
            currentChunk += element;
        } else {
            result.push(currentChunk);
            currentChunk = element;
        }
    }

    if (currentChunk) {
        result.push(currentChunk);
    }

    return result;
}

function printTableTop(columnWidths: number[], bold: boolean) {
    const topChar = bold ? "┏" : "┌";
    const separatorChar = bold ? "━" : "─";
    const junctionChar = bold ? "┳" : "┬";
    const endChar = bold ? "┓" : "┐";

    const topRow = columnWidths.map(width => separatorChar.repeat(width)).join(junctionChar);
    const output = `${topChar}${topRow}${endChar}\n`;

    stdout.write(output);
}

function printSeparator(columnWidths: number[], bold: boolean) {
    const separatorChar = bold ? "━" : "─";
    const cornerChar = bold ? "┡" : "├";
    const junctionChar = bold ? "╇" : "┼";
    const endChar = bold ? "┩" : "┤";

    const separatorRow = columnWidths.map(width => separatorChar.repeat(width)).join(junctionChar);
    const output = `${cornerChar}${separatorRow}${endChar}\n`;

    stdout.write(output);
}

function printTableBottom(columnWidths: number[]) {
    const bottomRow = columnWidths.map(width => "─".repeat(width)).join("┴");
    const output = `└${bottomRow}┘\n`;

    stdout.write(output);
}

function printValues(columnWidths: number[], values: string[], bold: boolean) {
    let output = bold ? "┃ " : "│ ";
    for (const [i, columnWidth] of columnWidths.entries()) {
        output += values[i].padEnd(columnWidth - 2) + " ";
        output += bold ? "┃ " : "│ ";
    }
    output += "\n"
    stdout.write(output);
}
