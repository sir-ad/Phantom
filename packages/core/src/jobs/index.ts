import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';

// Optional: Configure Redis connection via env vars, defaulting to localhost:6379
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    // Provide a gentle failure if Redis isn't running
    retryStrategy(times) {
        if (times > 3) {
            console.warn('[Phantom Jobs] Redis connection failed after 3 retries. Background jobs will be unavailable.');
            return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
    }
});

connection.on('error', (err) => {
    // Silence connection errors to prevent flooding dev console if Redis isn't used
    if ((err as any).code === 'ECONNREFUSED') {
        // Suppress
    }
});

// Define core Phantom queues
export const discoveryQueue = new Queue('discovery-loop', { connection: connection as any });
export const analysisQueue = new Queue('interview-analysis', { connection: connection as any });

// Define workers
export const startWorkers = () => {
    console.log('[Phantom Jobs] Initializing background workers...');

    const tokenOptions = { connection: connection as any, concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10) };

    const discoveryWorker = new Worker('discovery-loop', async (job: Job) => {
        console.log(`[Worker] Starting discovery job: ${job.id}`);
        // TODO: Import and execute core synthesis logic here
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`[Worker] Completed discovery job: ${job.id}`);
        return { success: true };
    }, tokenOptions);

    const analysisWorker = new Worker('interview-analysis', async (job: Job) => {
        console.log(`[Worker] Starting analysis job: ${job.id}`);
        // TODO: Import and execute core analysis logic here
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`[Worker] Completed analysis job: ${job.id}`);
        return { success: true };
    }, tokenOptions);

    discoveryWorker.on('failed', (job, err) => {
        console.error(`[Worker] Discovery job ${job?.id} failed with ${err.message}`);
    });

    analysisWorker.on('failed', (job, err) => {
        console.error(`[Worker] Analysis job ${job?.id} failed with ${err.message}`);
    });

    return { discoveryWorker, analysisWorker };
};

export async function closeQueues() {
    await discoveryQueue.close();
    await analysisQueue.close();
    connection.disconnect();
}
