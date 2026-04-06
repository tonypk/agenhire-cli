import { Command } from "commander";
import { getClient, handleError } from "./auth.js";
import { formatDate, formatMoney } from "../../format.js";

export function registerOfferCommands(program: Command): void {
  const offers = program
    .command("offers")
    .description("Offer and negotiation commands");

  offers
    .command("list")
    .description("List negotiations for an offer")
    .requiredOption("--offer-id <id>", "Offer ID")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(
      async (options: { offerId: string; key?: string; json?: boolean }) => {
        try {
          const client = getClient(options);
          const negotiations = await client.listNegotiations(options.offerId);

          if (options.json) {
            console.log(JSON.stringify(negotiations, null, 2));
            return;
          }

          if (negotiations.length === 0) {
            console.log("No negotiations found.");
            return;
          }

          negotiations.forEach((nego, idx) => {
            console.log(`\n${idx + 1}. Negotiation ${nego.id.slice(0, 8)}`);
            console.log(`   Agent: ${nego.agentId.slice(0, 8)}`);
            console.log(`   Message: ${nego.message || "(no message)"}`);
            if (nego.proposedSalary) {
              console.log(`   Proposed Salary: ${nego.proposedSalary} (cents)`);
            }
            console.log(`   Created: ${formatDate(nego.createdAt)}`);
          });
        } catch (err) {
          handleError(err);
        }
      },
    );

  offers
    .command("respond")
    .description("Respond to offer")
    .argument("<offerId>", "Offer ID")
    .requiredOption("--action <action>", "Action: ACCEPT, REJECT, or NEGOTIATE")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(
      async (
        offerId: string,
        options: {
          action: string;
          key?: string;
          json?: boolean;
        },
      ) => {
        try {
          const client = getClient(options);
          const action = options.action.toUpperCase();

          if (!["ACCEPT", "REJECT", "NEGOTIATE"].includes(action)) {
            console.error("Error: Action must be ACCEPT, REJECT, or NEGOTIATE");
            process.exit(1);
          }

          const offer = await client.respondToOffer(
            offerId,
            action as "ACCEPT" | "REJECT" | "NEGOTIATE",
          );

          if (options.json) {
            console.log(JSON.stringify(offer, null, 2));
            return;
          }

          console.log(`Offer ${offerId.slice(0, 8)} updated`);
          console.log(`Status: ${offer.status}`);
          console.log(`Action: ${action}`);
        } catch (err) {
          handleError(err);
        }
      },
    );

  offers
    .command("negotiate")
    .description("Send counter-proposal")
    .argument("<offerId>", "Offer ID")
    .requiredOption("--message <text>", "Negotiation message")
    .option("--salary <amount>", "Proposed salary (in cents)")
    .option("--key <key>", "Override API key")
    .option("--json", "Output raw JSON")
    .action(
      async (
        offerId: string,
        options: {
          message: string;
          salary?: string;
          key?: string;
          json?: boolean;
        },
      ) => {
        try {
          const client = getClient(options);
          const input = {
            message: options.message,
            proposedSalary: options.salary
              ? parseInt(options.salary, 10)
              : undefined,
          };

          const negotiation = await client.negotiateOffer(offerId, input);

          if (options.json) {
            console.log(JSON.stringify(negotiation, null, 2));
            return;
          }

          console.log(`Negotiation sent: ${negotiation.id.slice(0, 8)}`);
          console.log(`Message: ${negotiation.message}`);
          if (negotiation.proposedSalary) {
            console.log(
              `Proposed Salary: ${negotiation.proposedSalary} (cents)`,
            );
          }
        } catch (err) {
          handleError(err);
        }
      },
    );
}
