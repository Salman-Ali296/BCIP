import { validateEnv, env } from './config/env';
import { createApp } from './app';
import { prisma } from './config/database';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
    try {
        validateEnv();

        logger.info('Connecting to database...');

        await prisma.$connect();

        logger.info('Database connected successfully');

        const app = createApp();

        const server = app.listen(env.PORT, () => {
            logger.info(`Server running on http://localhost:${env.PORT}`, {
                environment: env.NODE_ENV,
            });
        });

        let shuttingDown = false;

        const shutdown = (signal: string): void => {
            if (shuttingDown) {
                return;
            }

            shuttingDown = true;

            logger.info(`${signal} received, starting graceful shutdown`);

            const forceShutdown = setTimeout(() => {
                logger.error('Forcing server shutdown after timeout');
                process.exit(1);
            }, 30_000);

            forceShutdown.unref();

            server.close(async (error?: Error) => {
                clearTimeout(forceShutdown);

                try {
                    await prisma.$disconnect();

                    if (error) {
                        logger.error('HTTP server closed with an error', error);
                        process.exitCode = 1;
                        return;
                    }

                    logger.info('Server shut down gracefully');
                } catch (disconnectError) {
                    logger.error(
                        'Failed to disconnect from the database',
                        disconnectError,
                    );

                    process.exitCode = 1;
                }
            });
        };

        process.once('SIGTERM', () => shutdown('SIGTERM'));
        process.once('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error('Failed to start server', error);

        await prisma.$disconnect();

        process.exitCode = 1;
    }
}

void startServer();