/** 扩展调试日志：控制台过滤关键字 `APM` 即可只看本扩展输出 */
const PREFIX = '[APM]'

export type LogContext = 'bg' | 'content' | 'ui' | 'sync'

export function apmLog(ctx: LogContext, ...args: unknown[]): void {
  console.log(`${PREFIX}[${ctx}]`, ...args)
}

export function apmWarn(ctx: LogContext, ...args: unknown[]): void {
  console.warn(`${PREFIX}[${ctx}]`, ...args)
}
