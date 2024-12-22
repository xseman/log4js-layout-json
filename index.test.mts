import assert from "node:assert";
import { test } from "node:test";

import {
	Config,
	format,
} from "./dist/index.js";

import Level from "log4js/lib/levels.js";
import LoggingEvent from "log4js/lib/LoggingEvent.js";

const mockEvent = new LoggingEvent(
	"default",
	new Level(20000, "INFO", "green"),
	["test"],
	{ ctx: "foo bar" },
	{
		fileName: "index.test.mts",
		functionName: "test",
	},
);

test("include context", () => {
	const config: Config = { includeContext: true };
	const result = format(mockEvent, config);
	// @ts-expect-error
	assert.equal(result.ctx, "foo bar");
});

test("include file name", () => {
	const config: Config = { includeFileName: true };
	const result = format(mockEvent, config);

	assert.equal(result.file_name, "index.test.mts");
});

test("include function name", () => {
	const config: Config = { includeFunctionName: true };
	const result = format(mockEvent, config);

	assert.equal(result.function_name, "test");
});
