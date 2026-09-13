import {
	describe,
	expect,
	test,
} from "bun:test";

import log4js from "log4js";
import { levels } from "log4js";
// @ts-ignore: missing type definitions
import LoggingEvent from "log4js/lib/LoggingEvent.js";

import {
	type Config,
	format,
	layout,
} from "./index.js";

function makeEvent(data: unknown[] = ["test"]): log4js.LoggingEvent {
	return new LoggingEvent(
		"default",
		levels.INFO,
		data,
		{ ctx: "foo bar" },
		{
			fileName: "index_test.ts",
			functionName: "test",
		},
	);
}

describe("format", () => {
	test("base fields", () => {
		const event = makeEvent();
		const result = format(event);

		expect(result.time).toBe(event.startTime);
		expect(result.category).toBe("default");
		expect(result.level).toBe("INFO");
		expect(result.msg).toBe("test");
	});

	test("include context", () => {
		const config: Config = { includeContext: true };
		const result = format(makeEvent(), config);

		expect(result).toHaveProperty("ctx", "foo bar");
	});

	test("include file name", () => {
		const config: Config = { includeFileName: true };
		const result = format(makeEvent(), config);

		expect(result.file_name).toBe("index_test.ts");
	});

	test("include function name", () => {
		const config: Config = { includeFunctionName: true };
		const result = format(makeEvent(), config);

		expect(result.function_name).toBe("test");
	});

	test("formats message arguments and skips objects", () => {
		const result = format(makeEvent(["user %s", "john", { skipped: true }]));

		expect(result.msg).toBe("user john");
	});
});

describe("layout", () => {
	test("returns json with context by default", () => {
		const output = layout()(makeEvent());
		const parsed = JSON.parse(output);

		expect(parsed).toMatchObject({
			category: "default",
			level: "INFO",
			msg: "test",
			ctx: "foo bar",
		});
		expect(parsed.file_name).toBeUndefined();
		expect(parsed.function_name).toBeUndefined();
	});
});
