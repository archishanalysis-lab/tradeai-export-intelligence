const subscribers = new Map();

const publishEvent = (organizationId, event) => {
    const key = organizationId?.toString() || "global";
    const events = subscribers.get(key) || [];
    events.push({
        ...event,
        createdAt: new Date(),
    });
    subscribers.set(key, events.slice(-100));

    return events.at(-1);
};

const getRecentEvents = (organizationId) => {
    const key = organizationId?.toString() || "global";
    return subscribers.get(key) || [];
};

export { getRecentEvents, publishEvent };
