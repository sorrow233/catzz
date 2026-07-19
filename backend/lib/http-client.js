const sleep = (durationMs) => new Promise(resolve => setTimeout(resolve, durationMs));

async function fetchWithRetry(url, options = {}, retryOptions = {}) {
    const {
        retries = 4,
        timeoutMs = 20_000,
        baseDelayMs = 600
    } = retryOptions;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            if (response.ok) return response;

            const retryable = response.status === 429 || response.status >= 500;
            if (!retryable) throw Object.assign(
                new Error(`HTTP ${response.status}: ${url}`),
                { retryable: false }
            );
            lastError = new Error(`HTTP ${response.status}: ${url}`);
        } catch (error) {
            lastError = error;
            if (error.retryable === false) break;
            if (attempt === retries) break;
        } finally {
            clearTimeout(timeout);
        }

        if (attempt < retries) {
            const jitter = Math.floor(Math.random() * 250);
            await sleep(baseDelayMs * (2 ** attempt) + jitter);
        }
    }

    throw new Error(`请求在 ${retries + 1} 次尝试后失败：${url}`, { cause: lastError });
}

async function mapWithConcurrency(items, concurrency, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;

            try {
                results[currentIndex] = {
                    status: 'fulfilled',
                    value: await worker(items[currentIndex], currentIndex)
                };
            } catch (reason) {
                results[currentIndex] = { status: 'rejected', reason };
            }
        }
    }

    const workerCount = Math.min(Math.max(1, concurrency), items.length);
    await Promise.all(Array.from({ length: workerCount }, runWorker));
    return results;
}

module.exports = { fetchWithRetry, mapWithConcurrency };
