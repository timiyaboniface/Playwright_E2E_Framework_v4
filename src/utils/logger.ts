/**
 * Logger — Utility class (OOP: Encapsulation)
 * Writes timestamped, coloured logs to console AND a persistent log file.
 * Each module instantiates Logger with its own context name.
 *
 * TestNG equivalent: ITestListener / Reporter
 */

import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'STEP';

const COLOURS: Record<LogLevel, string> = {
  INFO:  '\x1b[36m',   // Cyan
  WARN:  '\x1b[33m',   // Yellow
  ERROR: '\x1b[31m',   // Red
  DEBUG: '\x1b[90m',   // Grey
  STEP:  '\x1b[32m',   // Green
};
const RESET = '\x1b[0m';

export class Logger {
  private readonly context: string;
  private static logFilePath: string = path.resolve(process.cwd(), 'reports', 'test-execution.log');
  private static stream: fs.WriteStream | null = null;

  constructor(context: string) {
    this.context = context;
    Logger.initStream();
  }

  private static initStream(): void {
    if (!Logger.stream) {
      fs.mkdirSync(path.dirname(Logger.logFilePath), { recursive: true });
      Logger.stream = fs.createWriteStream(Logger.logFilePath, { flags: 'a' });
    }
  }

  private write(level: LogLevel, message: string): void {
    const ts   = new Date().toISOString();
    const line = `[${ts}] [${level.padEnd(5)}] [${this.context.padEnd(25)}] ${message}`;
    console.log(`${COLOURS[level]}${line}${RESET}`);
    Logger.stream?.write(line + '\n');
  }

  public info(msg: string): void  { this.write('INFO',  msg); }
  public warn(msg: string): void  { this.write('WARN',  msg); }
  public error(msg: string): void { this.write('ERROR', msg); }
  public debug(msg: string): void { this.write('DEBUG', msg); }

  /** Highlights BDD step execution — green, prefixed with arrow */
  public step(stepText: string): void { this.write('STEP', `▶ ${stepText}`); }

  public static closeStream(): void {
    Logger.stream?.end();
    Logger.stream = null;
  }
}
