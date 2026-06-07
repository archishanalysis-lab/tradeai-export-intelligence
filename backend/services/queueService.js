const memoryQueue = [];

const enqueueJob = async (name, payload = {}, options = {}) => {
    const job = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name,
        payload,
        options,
        status: "queued",
        createdAt: new Date(),
    };

    memoryQueue.push(job);

    return job;
};

const getQueuedJobs = () => memoryQueue.slice(-50).reverse();

const runJobInline = async (name, payload, handler) => {
    const job = await enqueueJob(name, payload, { inline: true });

    try {
        job.status = "processing";
        job.result = await handler(payload);
        job.status = "completed";
    } catch (error) {
        job.status = "failed";
        job.error = error.message;
        throw error;
    }

    return job;
};

export { enqueueJob, getQueuedJobs, runJobInline };
