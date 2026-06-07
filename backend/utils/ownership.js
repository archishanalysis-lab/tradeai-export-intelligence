const userScopeFilter = (user, ownerField = "createdBy") => {
    if (user.role === "admin") {
        return {};
    }

    if (user.organizationId) {
        return { organizationId: user.organizationId };
    }

    return { [ownerField]: user._id };
};

const assertCanAccess = (item, user, ownerField = "createdBy") => {
    if (user.role === "admin") {
        return true;
    }

    if (user.organizationId && item.organizationId) {
        return item.organizationId.toString() === user.organizationId.toString();
    }

    if (item[ownerField]) {
        return item[ownerField].toString() === user._id.toString();
    }

    return false;
};

export { assertCanAccess, userScopeFilter };
