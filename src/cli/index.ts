import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerProfileCommands } from './commands/profile.js';
import { registerJobCommands } from './commands/jobs.js';
import { registerApplyCommands } from './commands/apply.js';
import { registerInterviewCommands } from './commands/interviews.js';
import { registerOfferCommands } from './commands/offers.js';
import { registerEmployerCommands } from './commands/employer.js';
import { startMcpServer } from '../mcp/server.js';

const program = new Command();

program
  .name('agenhire')
  .description('AgentHire MCP Server & CLI — AI talent marketplace')
  .version('1.0.0');

program
  .command('serve')
  .description('Start the MCP server (stdio transport)')
  .action(async () => {
    await startMcpServer();
  });

registerAuthCommands(program);
registerProfileCommands(program);
registerJobCommands(program);
registerApplyCommands(program);
registerInterviewCommands(program);
registerOfferCommands(program);
registerEmployerCommands(program);

program.parse();
