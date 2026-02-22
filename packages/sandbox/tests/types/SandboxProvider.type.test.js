"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._typecheckInstance = void 0;
const SandboxProvider_1 = require("../../src/providers/SandboxProvider");
class TypeCheckedProvider extends SandboxProvider_1.SandboxProvider {
    async provision(id) { return { id, workdir: '/workspace', createdAt: new Date().toISOString() }; }
    async exec(ctx, cmd, args, opts) { return { stdout: '', stderr: '', exitCode: 0 }; }
    async destroy(ctx) { return; }
    async getResourceStats(ctx) { return { cpuPercent: 0, memoryBytes: 0, timestamp: new Date().toISOString() }; }
}
exports._typecheckInstance = new TypeCheckedProvider();
