const format = (level, args) => [`[joblens] ${level}`, ...args];

export const logger = {
  info: (...args) => console.info(...format('info', args)),
  warn: (...args) => console.warn(...format('warn', args)),
  error: (...args) => console.error(...format('error', args)),
};
