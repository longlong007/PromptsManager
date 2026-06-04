const PREFIX = '[APM-IDE]'

export type LogContext = 'ui' | 'sync'

export function apmLog(ctx: LogContext, ...args: unknown[]): void {
  console.log(`${PREFIX}[${ctx}]`, ...args)
}
