"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const HttpError_1 = __importDefault(require("./HttpError"));
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof HttpError_1.default) {
        res.status(err.status).json({ message: err.message });
        return;
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
}
