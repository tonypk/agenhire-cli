import { Command } from "commander";
import { readFileSync } from "node:fs";
import { getClient, handleError } from "./auth.js";
import { AgentHireClient } from "../../client.js";
import { formatMoney, formatTable } from "../../format.js";

export function registerJobCommands(program: Command): void {
  const jobs = program
    .command("jobs")
    .description("Job browsing and management commands");

  jobs
    .command("list")
    .description("Browse public jobs")
    .option("--page <n>", "Page number", "1")
    .option("--country <code>", "Filter by country code")
    .option("--q <query>", "Search query")
    .option("--json", "Output raw JSON")
    .action(
      async (options: {
        page?: string;
        country?: string;
        q?: string;
        json?: boolean;
      }) => {
        try {
          const client = new AgentHireClient({
            baseUrl: "https://agenhire.com",
          });
          const params: Record<string, string | number> = {
            page: parseInt(options.page || "1", 10),
          };
          if (options.country) params.country = options.country;
          if (options.q) params.q = options.q;

          const result = await client.listPublicJobs(params);

          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
          }

          if (result.data.length === 0) {
            console.log("No jobs found.");
            return;
          }

          const rows = result.data.map((job) => ({
            title: job.title || "(no title)",
            salary:
              job.salaryMin && job.salaryMax && job.currency
                ? `${formatMoney(job.salaryMin, job.currency)} - ${formatMoney(job.salaryMax, job.currency)}`
                : "(not set)",
            type: job.workArrangement || "(not set)",
            country: job.countryCode || "(not set)",
          }));

          console.log(
            formatTable(rows, [
              { key: "title", header: "Title", width: 30 },
              { key: "salary", header: "Salary Range", width: 25 },
              { key: "type", header: "Type", width: 15 },
              { key: "country", header: "Country", width: 10 },
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

  jobs
    .command("search")
    .description("AI-matched job recommendations")
    .option("--key <key>", "Override API key")
    .option("--limit <n>", "Max results", "10")
    .option("--json", "Output raw JSON")
    .action(
      async (options: { key?: string; limit?: string; json?: boolean }) => {
        try {
          const client = getClient(options);
          const limit = parseInt(options.limit || "10", 10);
          const matches = await client.getMatchedJobs(limit);

          if (options.json) {
            console.log(JSON.stringify(matches, null, 2));
            return;
          }

          if (matches.length === 0) {
            console.log("No matching jobs found.");
            return;
          }

          matches.forEach((match, idx) => {
            console.log(
              `\n${idx + 1}. Job ID: ${match.jobId?.slice(0, 8)} (Score: ${match.score.toFixed(2)})`,
            );
            if (match.breakdown) {
              console.log(`   Breakdown: ${JSON.stringify(match.breakdown)}`);
            }
          });
        } catch (err) {
          handleError(err);
        }
      },
    );

  jobs
    .command("view")
    .description("View public job details")
    .argument("<slug>", "Job slug")
    .option("--json", "Output raw JSON")
    .action(async (slug: string, options: { json?: boolean }) => {
      try {
        const client = new AgentHireClient({ baseUrl: "https://agenhire.com" });
        const job = await client.getPublicJob(slug);

        if (options.json || typeof job === "string") {
          console.log(
            typeof job === "string" ? job : JSON.stringify(job, null, 2),
          );
          return;
        }

        console.log(`Title:       ${job.title}`);
        console.log(`Description: ${JSON.stringify(job.description)}`);
        console.log(`Type:        ${job.workArrangement}`);
        console.log(`Country:     ${job.countryCode}`);
        if (job.salaryMin && job.salaryMax && job.currency) {
          console.log(
            `Salary:      ${formatMoney(job.salaryMin, job.currency)} - ${formatMoney(job.salaryMax, job.currency)}`,
          );
        }
        console.log(`Status:      ${job.status}`);
      } catch (err) {
        handleError(err);
      }
    });

  jobs
    .command("create")
    .description("Create job from JSON file")
    .requiredOption("--file <path>", "Path to JSON file")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(async (options: { file: string; key?: string; json?: boolean }) => {
      try {
        const client = getClient(options);
        const raw = readFileSync(options.file, "utf-8");
        const input = JSON.parse(raw);
        const job = await client.createJob(input);

        if (options.json) {
          console.log(JSON.stringify(job, null, 2));
          return;
        }

        console.log(`Job created: ${job.id.slice(0, 8)}`);
        console.log(`Title: ${job.title}`);
        console.log(`Status: ${job.status}`);
      } catch (err) {
        handleError(err);
      }
    });

  jobs
    .command("activate")
    .description("Activate draft job")
    .argument("<id>", "Job ID")
    .option("--key <key>", "Override API key")
    .action(async (id: string, options: { key?: string }) => {
      try {
        const client = getClient(options);
        const job = await client.activateJob(id);
        console.log(`Job activated: ${job.id.slice(0, 8)}`);
        console.log(`Status: ${job.status}`);
      } catch (err) {
        handleError(err);
      }
    });
}
