# @captureflow/mcp

CaptureFlow's MCP server, on your own computer. Your AI agent records the web
app you're running on localhost, your screen, or one app's window, with slides
and a voiceover, and gives you a CaptureFlow link to share.

```sh
claude mcp add captureflow -- npx -y @captureflow/mcp
```

Then ask: "Record a demo of the signup flow on localhost:3000, with a voiceover."

- `npx @captureflow/mcp login` signs this computer in (the agent also starts
  this the first time it records).
- `--save-dir <folder>` saves MP4 files instead of uploading, with no sign-in.
- `npx @captureflow/mcp --help` lists every option.

Guide: https://docs.captureflow.dev/guide/local-agent

## Develop

```sh
pnpm --filter @captureflow/mcp build
claude mcp add captureflow-dev -- node apps/mcp/dist/cli.mjs --url http://localhost:3032
```

`src/server.ts` holds the tools; recording itself is
`@captureflow/agent-recorder`, shared with the cloud recorder in `apps/recorder`.
