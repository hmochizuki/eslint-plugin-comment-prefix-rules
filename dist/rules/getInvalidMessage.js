"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvalidMessage = void 0;
const getInvalidMessage = (commentType, commentValue) => {
    return `${commentType} comment "${commentValue}" does not match any of the user-defined line rules.`;
};
exports.getInvalidMessage = getInvalidMessage;
