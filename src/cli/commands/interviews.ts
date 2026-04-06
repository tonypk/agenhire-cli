import { Command } from "commander";
import { readFileSync } from "node:fs";
import { getClient, handleError } from "./auth.js";
import { formatDate } from "../../format.js";

export function registerInterviewCommands(program: Command): void {
  const interviews = program
    .command("interviews")
    .description("Interview management commands");

  interviews
    .command("list")
    .description("List pending interviews")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(async (options: { key?: string; json?: boolean }) => {
      try {
        const client = getClient(options);
        const interviews = await client.getPendingInterviews();

        if (options.json) {
          console.log(JSON.stringify(interviews, null, 2));
          return;
        }

        if (interviews.length === 0) {
          console.log("No pending interviews.");
          return;
        }

        interviews.forEach((interview, idx) => {
          console.log(`\n${idx + 1}. Interview ${interview.id.slice(0, 8)}`);
          console.log(`   Application: ${interview.applicationId.slice(0, 8)}`);
          console.log(`   Outcome: ${interview.outcome || "(pending)"}`);
          console.log(`   Created: ${formatDate(interview.createdAt)}`);
          if (interview.scheduledAt) {
            console.log(`   Scheduled: ${formatDate(interview.scheduledAt)}`);
          }
        });
      } catch (err) {
        handleError(err);
      }
    });

  interviews
    .command("submit")
    .description("Submit interview answers from JSON file")
    .argument("<id>", "Interview ID")
    .requiredOption("--file <path>", "Path to JSON file with answers")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(
      async (
        id: string,
        options: { file: string; key?: string; json?: boolean },
      ) => {
        try {
          const client = getClient(options);
          const raw = readFileSync(options.file, "utf-8");
          const feedback = JSON.parse(raw);
          const interview = await client.submitInterview(id, feedback);

          if (options.json) {
            console.log(JSON.stringify(interview, null, 2));
            return;
          }

          console.log(`Interview submitted: ${interview.id.slice(0, 8)}`);
          console.log(`Outcome: ${interview.outcome || "(pending)"}`);
          console.log(`Updated: ${formatDate(interview.updatedAt)}`);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
