export const getInvalidMessage = (commentType, commentValue) => {
    return `${commentType} comment "${commentValue}" does not match any of the user-defined line rules.`;
};
