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

describe("format edge cases", () => {
	test("resolves file name from a file URL", () => {
		const event = new LoggingEvent("default", levels.INFO, ["test"], {}, {
			fileName: "file:///srv/app/main.mjs",
		});
		const result = format(event, { includeFileName: true });

		expect(result.file_name).toBe("main.mjs");
	});

	test("accepts non-array event data", () => {
		const event = new LoggingEvent("default", levels.INFO, "plain", {});
		const result = format(event);

		expect(result.msg).toBe("plain");
	});

	test("omits msg when the event has no printable data", () => {
		const result = format(makeEvent([{ only: "object" }]));

		expect(result).not.toHaveProperty("msg");
		expect(JSON.parse(layout()(makeEvent([{ only: "object" }])))).not.toHaveProperty("msg");
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
