import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

export interface Credentials {
    username: string;
    password: string;
}

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing env variable ${name}. Copy .env.example to .env and fill it in.`);
    }
    return value;
};

/** Typed access to `.env`. Values are read lazily so a missing variable fails only the tests that need it. */
export const env = {
    get standardUser(): Credentials {
        return {
            username: required('STANDARD_USER'),
            password: required('STANDARD_USER_PASSWORD'),
        };
    },
};
