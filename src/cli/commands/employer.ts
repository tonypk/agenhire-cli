import { Command } from "commander";
import { getClient, handleError } from "./auth.js";
import { formatTable, formatDate } from "../../format.js";

export function registerEmployerCommands(program: Command): void {
  const employer = program
    .command("employer")
    .description("Employer-specific commands");

  employer
    .command("setup")
    .description("Create employer profile")
    .requiredOption("--company <name>", "Company name")
    .requiredOption("--country <code>", "Country code")
    .option("--currencies <list>", "Supported currencies (comma-separated)")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(
      async (options: {
        company: string;
        country: string;
        currencies?: string;
        key?: string;
        json?: boolean;
      }) => {
        try {
          const client = getClient(options);
          const input = {
            companyName: options.company,
            countryCode: options.country,
            acceptedCurrencies: options.currencies
              ? options.currencies.split(",").map((s) => s.trim())
              : undefined,
          };

          const profile = await client.createEmployerProfile(input);

          if (options.json) {
            console.log(JSON.stringify(profile, null, 2));
            return;
          }

          console.log("Employer profile created");
          console.log(`Company: ${profile.companyName}`);
          console.log(`Country: ${profile.countryCode}`);
          console.log(`Verification Tier: ${profile.verificationTier}`);
        } catch (err) {
          handleError(err);
        }
      },
    );

  employer
    .command("verify-email")
    .description("Request email verification code")
    .argument("<email>", "Email address")
    .option("--key <key>", "Override API key")
    .action(async (email: string, options: { key?: string }) => {
      try {
        const client = getClient(options);
        await client.requestEmailVerification(email);
        console.log(`Verification code sent to ${email}`);
      } catch (err) {
        handleError(err);
      }
    });

  employer
    .command("confirm-email")
    .description("Confirm email with verification code")
    .argument("<email>", "Email address")
    .requiredOption("--code <code>", "Verification code")
    .option("--key <key>", "Override API key")
    .action(async (email: string, options: { code: string; key?: string }) => {
      try {
        const client = getClient(options);
        await client.confirmEmailVerification(email, options.code);
        console.log(`Email ${email} verified successfully`);
      } catch (err) {
        handleError(err);
      }
    });

  employer
    .command("status")
    .description("Show employer profile and sandbox status")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(async (options: { key?: string; json?: boolean }) => {
      try {
        const client = getClient(options);
        const [profile, sandbox] = await Promise.all([
          client.getEmployerProfile(),
          client.getSandboxStatus(),
        ]);

        if (options.json) {
          console.log(JSON.stringify({ profile, sandbox }, null, 2));
          return;
        }

        console.log("=== Employer Profile ===");
        console.log(`Company:     ${profile.companyName}`);
        console.log(`Country:     ${profile.countryCode}`);
        console.log(
          `Currencies:  ${profile.acceptedCurrencies?.join(", ") || "(not set)"}`,
        );
        console.log(`Verification Tier: ${profile.verificationTier}`);

        console.log("\n=== Sandbox Status ===");
        console.log(`In Sandbox:  ${sandbox.inSandbox ? "Yes" : "No"}`);
        console.log(`Tier:        ${sandbox.verificationTier}`);
        if (sandbox.sandboxUntil) {
          console.log(`Sandbox Until: ${sandbox.sandboxUntil}`);
        }
      } catch (err) {
        handleError(err);
      }
    });

  employer
    .command("review")
    .description("List applications for a job")
    .argument("<jobId>", "Job ID")
    .option("--key <key>", "Override API key")
    .option("--status <status>", "Filter by status")
    .option("--json", "Output raw JSON")
    .action(
      async (
        jobId: string,
        options: {
          key?: string;
          status?: string;
          json?: boolean;
        },
      ) => {
        try {
          const client = getClient(options);
          const params: Record<string, string> = {};
          if (options.status) params.status = options.status;

          const result = await client.listJobApplications(jobId, params);

          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
          }

          if (result.data.length === 0) {
            console.log("No applications found.");
            return;
          }

          const rows = result.data.map((app) => ({
            id: app.id.slice(0, 8),
            candidate: app.candidateId.slice(0, 8),
            status: app.status,
            date: formatDate(app.createdAt),
          }));

          console.log(
            formatTable(rows, [
              { key: "id", header: "ID", width: 10 },
              { key: "candidate", header: "Candidate", width: 10 },
              { key: "status", header: "Status", width: 15 },
              { key: "date", header: "Date", width: 15 },
            ]),
          );

          const { page, limit, total } = result.meta;
          const totalPages = Math.ceil(total / limit);
          console.log(`\nPage ${page} of ${totalPages} (${total} total)`);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
