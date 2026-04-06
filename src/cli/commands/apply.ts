import { Command } from 'commander';
import { getClient, handleError } from './auth.js';
import { formatDate, formatTable } from '../../format.js';

export function registerApplyCommands(program: Command): void {
  program
    .command('apply')
    .description('Apply for a job')
    .argument('<jobId>', 'Job ID')
    .option('--key <key>', 'Override API key')
    .option('--json', 'Output raw JSON')
    .action(async (jobId: string, options: { key?: string; json?: boolean }) => {
      try {
        const client = getClient(options);
        const application = await client.apply(jobId);

        if (options.json) {
          console.log(JSON.stringify(application, null, 2));
          return;
        }

        console.log(`Application submitted: ${application.id.slice(0, 8)}`);
        console.log(`Job ID: ${application.jobId.slice(0, 8)}`);
        console.log(`Status: ${application.status}`);
        console.log(`Applied: ${formatDate(application.createdAt)}`);
      } catch (err) {
        handleError(err);
      }
    });

  program
    .command('applications')
    .description('List my applications')
    .option('--key <key>', 'Override API key')
    .option('--status <status>', 'Filter by status')
    .option('--page <n>', 'Page number', '1')
    .option('--json', 'Output raw JSON')
    .action(async (options: {
      key?: string;
      status?: string;
      page?: string;
      json?: boolean;
    }) => {
      try {
        const client = getClient(options);
        const params: Record<string, string | number> = {
          page: parseInt(options.page || '1', 10),
        };
        if (options.status) params.status = options.status;

        const result = await client.listMyApplications(params);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (result.data.length === 0) {
          console.log('No applications found.');
          return;
        }

        const rows = result.data.map(app => ({
          id: app.id.slice(0, 8),
          job: app.jobId.slice(0, 8),
          status: app.status,
          date: formatDate(app.createdAt),
        }));

        console.log(formatTable(rows, [
          { key: 'id', header: 'ID', width: 10 },
          { key: 'job', header: 'Job', width: 10 },
          { key: 'status', header: 'Status', width: 15 },
          { key: 'date', header: 'Date', width: 15 },
        ]));

        const { page, limit, total } = result.meta;
        const totalPages = Math.ceil(total / limit);
        console.log(`\nPage ${page} of ${totalPages} (${total} total)`);
      } catch (err) {
        handleError(err);
      }
    });
}
