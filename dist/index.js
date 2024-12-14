"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const comment_prefix_1 = __importDefault(require("./rules/comment-prefix"));
exports.rules = {
    "code-comments-rule": comment_prefix_1.default
};
