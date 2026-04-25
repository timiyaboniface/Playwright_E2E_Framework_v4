/**
 * ExcelReader — Utility class (OOP: Encapsulation)
 * Reads test data from Excel spreadsheet using ExcelJS.
 *
 * Supports:
 *  - Multiple named sheets (one per feature/suite)
 *  - Auto-detected header row (row 1)
 *  - Active/inactive row filtering via "active" column (yes/no)
 *  - Strongly-typed return via TestDataRow interface
 *
 * TestNG equivalent: @DataProvider reading from Excel
 */

import * as ExcelJS from 'exceljs';
import * as path from 'path';
import { TestDataRow } from '../types/framework.types';

export class ExcelReader {
  private readonly filePath: string;
  private workbook: ExcelJS.Workbook | null = null;

  /**
   * @param fileName — Excel file inside /test-data/ folder (default: test-data.xlsx)
   */
  constructor(fileName = 'test-data.xlsx') {
    this.filePath = path.resolve(process.cwd(), 'test-data', fileName);
  }

  /** Lazily load the workbook (cached after first read) */
  private async load(): Promise<ExcelJS.Workbook> {
    if (!this.workbook) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(this.filePath);
      this.workbook = wb;
    }
    return this.workbook;
  }

  /**
   * Read all active rows from a named sheet.
   * Rows where "active" column ≠ "yes" are skipped automatically.
   *
   * @param sheetName — Tab name in the Excel file
   */
  public async readSheet(sheetName: string): Promise<TestDataRow[]> {
    const wb    = await this.load();
    const sheet = wb.getWorksheet(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in ${this.filePath}`);
    }

    const headers: string[] = [];
    const rows: TestDataRow[] = [];

    sheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        row.eachCell((cell) => headers.push(String(cell.value ?? '').trim()));
        return;
      }

      const record: Record<string, string> = {};
      row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
        const header = headers[colIdx - 1];
        if (header) record[header] = String(cell.value ?? '').trim();
      });

      if (record['active']?.toLowerCase() !== 'yes') return;

      rows.push(record as unknown as TestDataRow);
    });

    return rows;
  }

  /**
   * Read a single row by testId from a given sheet.
   */
  public async getRowById(sheetName: string, testId: string): Promise<TestDataRow | null> {
    const rows = await this.readSheet(sheetName);
    return rows.find((r) => r.testId === testId) ?? null;
  }

  /** List all worksheet names */
  public async getSheetNames(): Promise<string[]> {
    const wb = await this.load();
    return wb.worksheets.map((ws) => ws.name);
  }
}
