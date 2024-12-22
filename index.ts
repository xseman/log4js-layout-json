import path from "node:path";
import url from "node:url";
import util from "node:util";
import { isNativeError } from "node:util/types";

import type log4js from "log4js";

interface Output {
	/**
	 * ISO-8601 format
	 */
	time: Date;
	/**
	 * Category name of log4js instance.
	 */
	category: string;
	/**
	 * log4js.Level.levelStr
	 */
	level: string;
	/**
	 * Data passed to log argument, formatted using `util.format`.
	 */
	msg?: string;
	/**
	 * The name of the file where the log message originated
	 */
	file_name?: string;
	/**
	 * The name of the function where the log message originated
	 */
	function_name?: string;
}

/**
 * Parses the file name from a logging event
 */
function parseFileName(loggingEvent: log4js.LoggingEvent): string | undefined {
	let filename = loggingEvent.fileName || "";
	if (filename.startsWith("file://")) {
		filename = url.fileURLToPath(filename);
	}

	return filename.split(path.sep).at(-1);
}

/**
 * Formats a log event into the desired output format
 */
function format(event: log4js.LoggingEvent, config?: Config): Output {
	const output: Output = {
		time: event.startTime,
		category: event.categoryName,
		level: event.level.levelStr,
	};

	if (config?.includeContext) {
		Object.assign(output, event.context);
	}

	if (config?.includeFunctionName && event.functionName) {
		output.function_name = event.functionName;
	}

	if (config?.includeFileName) {
		const filename = parseFileName(event);
		if (filename) {
			output.file_name = filename;
		}
	}

	let msgs: Array<any> | undefined;
	if (Array.isArray(event.data)) {
		msgs = event.data;
	} else {
		msgs = [event.data];
	}

	msgs = msgs
		.filter((m) => isNativeError(m) || typeof m !== "object")
		.filter(Boolean);

	output.msg = util.format(...msgs);

	if (output.msg === undefined) {
		delete output.msg;
	}

	return output;
}

export interface Config {
	/**
	 * Include context added using `log.addContext()`
	 *
	 * @default true
	 */
	includeContext?: boolean;
	/**
	 * Include file name in json output.
	 *
	 * @default false
	 */
	includeFileName?: boolean;
	/**
	 * Include function name in json output.
	 *
	 * @requires log4js>=6.7
	 * @default false
	 */
	includeFunctionName?: boolean;
}

/**
 * Creates a JSON layout function for log4js.
 */
export function layout(config?: Config): log4js.LayoutFunction {
	const defaults = {
		includeContext: true,
		includeFileName: false,
		includeFunctionName: false,
	};

	const _config = Object.assign({}, defaults, config);

	return (event: log4js.LoggingEvent): string => {
		const formated = format(event, _config);
		const output = JSON.stringify(formated);

		return output;
	};
}
