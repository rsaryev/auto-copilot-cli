import ora from 'ora';
import {exec, spawn} from 'child_process';
import chalk from 'chalk';
import {Tiktoken} from '@dqbd/tiktoken/lite';
import {load} from '@dqbd/tiktoken/load';
import registry from '@dqbd/tiktoken/registry.json';
import models from '@dqbd/tiktoken/model_to_encoding.json';

export const exFunction = async <T>(fn: () => Promise<T>, message: string, successMessage: string): Promise<T> => {
    const spinner = ora(message).start();
    try {
        const result = await fn();
        spinner.succeed(successMessage);
        return result;
    } catch (error) {
        spinner.fail();
        throw error;
    }
};

export function executeCommand(command: string) {
    return new Promise((resolve) => {
        const child = exec(command);
        child.stdout?.on('data', (data) => {
            process.stdout.write(data);
        });

        child.stderr?.on('data', (data) => {
            process.stderr.write(data);
        });

        child.on('close', (code) => {
            resolve(code);
        });
    });
}

export function executeShell(command: string) {
    return new Promise((resolve) => {
        const child = spawn(command, [], {shell: true});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.stdin.pipe(process.stdin);
        process.stdin.pipe(child.stdin);

        child.on('close', (code) => {
            resolve(code);
        });
    });
}

export function checkNodeVersion() {
    const nodeVersion = process.versions.node.split('.')[0];
    if (Number(nodeVersion) < 18) {
        console.log(`${chalk.red('✘')} Please update your node version to 18 or above\nCurrent version: ${nodeVersion}`);
        process.exit(1);
    }
}

export function getPackageManagerByOs() {
    const os = process.platform;
    const packageManager: Record<string, string> = {
        linux: 'apt-get',
        darwin: 'brew',
        win32: 'choco',
    };
    return packageManager[os] || 'apt-get';
}

export async function calculateCost(modelName: string, docs: string[]) {
    const spinner = ora('Calculating cost').start();
    try {
        const {bpe_ranks, special_tokens, pat_str} = await load(registry[models[modelName]]);
        const encoder = new Tiktoken(bpe_ranks, special_tokens, pat_str);
        const tokenCount = encoder.encode(JSON.stringify(docs)).length;
        const cost = (tokenCount / 1000) * 0.0005;
        encoder.free();
        return cost;
    } finally {
        spinner.stop();
    }
}
