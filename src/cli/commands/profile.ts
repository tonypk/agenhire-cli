import { Command } from "commander";
import { getClient, handleError } from "./auth.js";
import type { Agent } from "../../types.js";

export function registerProfileCommands(program: Command): void {
  const profile = program
    .command("profile")
    .description("Candidate profile commands");

  profile
    .command("view")
    .description("Show candidate profile")
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

        console.log(`ID:              ${agent.id}`);
        console.log(`Type:            ${agent.type}`);
        console.log(`Country:         ${agent.countryCode}`);
        console.log(`Language:        ${agent.lang}`);
        console.log(`Status:          ${agent.status}`);

        if (agent.ownerEmail) {
          console.log(`Email:           ${agent.ownerEmail}`);
        }
        if (agent.ownerTelegramId) {
          console.log(`Telegram ID:     ${agent.ownerTelegramId}`);
        }

        console.log(
          "\nNote: Use the MCP server or API to view full candidate profile details (headline, skills, etc.)",
        );
      } catch (err) {
        handleError(err);
      }
    });

  profile
    .command("update")
    .description("Update candidate profile")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .option("--headline <text>", "Professional headline")
    .option("--timezone <tz>", "Timezone (e.g., America/New_York)")
    .option("--currency <code>", "Currency code (e.g., USD)")
    .option("--salary-min <amount>", "Minimum salary (in cents)")
    .option("--salary-max <amount>", "Maximum salary (in cents)")
    .option("--work-pref <list>", "Work preferences (comma-separated)")
    .option("--skills <list>", "Skills (comma-separated)")
    .option("--roles <list>", "Roles (comma-separated)")
    .action(
      async (options: {
        key?: string;
        json?: boolean;
        headline?: string;
        timezone?: string;
        currency?: string;
        salaryMin?: string;
        salaryMax?: string;
        workPref?: string;
        skills?: string;
        roles?: string;
      }) => {
        try {
          const client = getClient(options);

          const input: Record<string, unknown> = {};

          if (options.headline !== undefined) input.headline = options.headline;
          if (options.timezone !== undefined) input.timezone = options.timezone;
          if (options.currency !== undefined)
            input.preferredCurrency = options.currency;
          if (options.salaryMin !== undefined)
            input.salaryMin = parseInt(options.salaryMin, 10);
          if (options.salaryMax !== undefined)
            input.salaryMax = parseInt(options.salaryMax, 10);
          if (options.workPref !== undefined)
            input.workArrangementPref = options.workPref
              .split(",")
              .map((s) => s.trim());
          if (options.skills !== undefined || options.roles !== undefined) {
            const intentJson: Record<string, unknown> = {};
            if (options.skills) {
              intentJson.skills = options.skills
                .split(",")
                .map((s) => s.trim());
            }
            if (options.roles) {
              intentJson.desiredRoles = options.roles
                .split(",")
                .map((s) => s.trim());
            }
            input.intentJson = intentJson;
          }

          await client.updateCandidate(input);

          if (options.json) {
            console.log(JSON.stringify({ success: true }, null, 2));
            return;
          }

          console.log("Profile updated successfully");
        } catch (err) {
          handleError(err);
        }
      },
    );
}
