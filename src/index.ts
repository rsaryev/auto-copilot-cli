import chalk from 'chalk';
import { main } from './main';
import logger from './libs/logger';

main()
  .then(() => {
    logger.info(chalk.green('Done!'));
  })
  .catch((err) => {
    logger.error(chalk.red(err));
  });
