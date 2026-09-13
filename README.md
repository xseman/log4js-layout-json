# log4js layout - json

Simple json layout module for [log4js][log4js_github].

[log4js_github]: https://log4js-node.github.io/log4js-node/

## Installation

```sh
npm install log4js-layout-json
# or
bun add log4js-layout-json
```

## Example Output

Output:

```plain
{"time":"2024-05-11T18:18:34.266Z","category":"default","level":"INFO","msg":"Initializing DB connection"}
```

Adding context:

```ts
log.addContext("user", "john");
```

```plain
{"time":"2024-05-11T18:19:34.266Z","category":"default","level":"INFO","msg":"Initializing DB connection","user":"john"}
```

## Usage

Set the layout type to `json`.

Each log object contains the following properties:

- `time` - time in ISO 8601 format
- `category` - specified when log4js is initialized
- `msg` - if the log message is a string, otherwise omitted
- `level` - level in human readable format

## Example configuration

```ts
import log4js from "log4js";
import { layout as jsonLayout } from "log4js-layout-json";

log4js.addLayout("json", jsonLayout);
```

minimal:

```ts
log4js.configure({
	appenders: {
		out: {
			type: "stdout",
			layout: {
				type: "json",
				includeFileName: true,
				includeFunctionName: true,
			},
		},
	},
	categories: {
		default: {
			level: "debug",
			appenders: ["out"],
		},
	},
});
```
