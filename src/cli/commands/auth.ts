import { Command } from "commander";
import { createInterface } from "node:readline";
import { AgentHireClient } from "../../client.js";
import {
  resolveApiKey,
  resolveBaseUrl,
  saveConfig,
  deleteConfig,
} from "../../auth.js";
import { AgentHireError } from "../../errors.js";

export function getClient(options?: { key?: string }): AgentHireClient {
  const apiKey = resolveApiKey(options);
  if (!apiKey) {
    console.error('Error: No API key found. Use --key or run "agenhire login"');
    process.exit(1);
  }
  return new AgentHireClient({ apiKey, baseUrl: resolveBaseUrl() });
}

export function handleError(err: unknown): never {
  if (err instanceof AgentHireError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error: ${String(err)}`);
  process.exit(1);
}

export function registerAuthCommands(program: Command): void {
  const auth = program
    .command("auth")
    .alias("login")
    .description("Authentication commands");

  auth
    .command("login")
    .description("Save API key to ~/.agenhire/config.json")
    .option("--key <key>", "API key (if not provided, will prompt)")
    .action(async (options: { key?: string }) => {
      let apiKey = options.key;

      // If no key provided, prompt for it
      if (!apiKey) {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        apiKey = await new Promise<string>((resolve) => {
          rl.question("Enter your AgentHire API key: ", (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });
      }

      // Validate format
      if (!apiKey.startsWith("ah_cand_") && !apiKey.startsWith("ah_empl_")) {
        console.error(
          "Error: Invalid API key format. Must start with ah_cand_ or ah_empl_",
        );
        process.exit(1);
      }

      // Save config
      saveConfig({ apiKey, baseUrl: resolveBaseUrl() });

      // Verify by calling getMe
      try {
        const client = new AgentHireClient({
          apiKey,
          baseUrl: resolveBaseUrl(),
        });
        const agent = await client.getMe();
        console.log(
          `Logged in as ${agent.type} agent (ID: ${agent.id.slice(0, 8)})`,
        );
        console.log(`Config saved to ~/.agenhire/config.json`);
      } catch (err) {
        handleError(err);
      }
    });

  auth
    .command("whoami")
    .description("Show current agent info")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(async (options: { key?: string; json?: boolean }) => {
      try {
        const client = getClient(options);
        const agent = await client.getMe();

        if (options.json) {
          console.log(JSON.stringify(agent, null, 2));
          return;
        }

        console.log(`ID:        ${agent.id}`);
        console.log(`Type:      ${agent.type}`);
        console.log(`Country:   ${agent.countryCode}`);
        console.log(`Language:  ${agent.lang}`);
        console.log(`Status:    ${agent.status}`);
        if (agent.ownerEmail) {
          console.log(`Email:     ${agent.ownerEmail}`);
        }
      } catch (err) {
        handleError(err);
      }
    });

  auth
    .command("logout")
    .description("Delete config file")
    .action(() => {
      deleteConfig();
      console.log("Logged out. Config file deleted.");
    });
}
