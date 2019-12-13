import * as process from 'process';

const fetch = require('node-fetch');
const jsonfile = require('jsonfile');
const fs = require('fs');

import {Endpoint, endpoints} from './config/endpoints';
import {WriteFileOptions} from "fs";

const DEFAULT_CWD = process.cwd(); // <path>/mock-generator

export class MockGenerator {
    static INSTANCE: MockGenerator = null;

    // CONFIGURE THOSE CONSTANTS BELOW!
    readonly OUT_DIR;
    readonly LOG_DIR;
    readonly INTERFACE_DIR;

    readonly FILE_LOGGING;
    readonly logger: string[] = [];

    private constructor() {
        this.OUT_DIR = process.env.OUT_DIR || `${DEFAULT_CWD}/fixtures`;
        this.LOG_DIR = process.env.LOG_DIR || `${DEFAULT_CWD}/logs`;
        this.INTERFACE_DIR = process.env.INTERFACE_DIR || `./../interfaces`;
        this.FILE_LOGGING = false;
    }

    static async run(): Promise<any> {
        if (!MockGenerator.INSTANCE) {
            MockGenerator.INSTANCE = new MockGenerator();
        }
        await MockGenerator.INSTANCE.fetchAll();

        if (MockGenerator.INSTANCE.FILE_LOGGING) {
            MockGenerator.INSTANCE.logToFile();
        }
    }

    fetchAll(): Promise<any> {
        const promises: Promise<any>[] = [];
        Object.entries(endpoints).forEach(([k, e]) => {
            promises.push(MockGenerator.INSTANCE.fetchMock(e));
        });

        return Promise.all(promises);
    }

    logToFile(): void {
        return fs.writeFileSync(`${this.LOG_DIR}/${Date.now()}.log`, this.logger.join('\r\n'));
    }

    logInternally(msg): void {
        console.log(msg);
        this.logger.push(msg);
    }

    fetchMock(endpoint: Endpoint): Promise<any> {
        return fetch(endpoint.url)
            .then(this.handleErrors)
            .then(res => res.json())
            //.then(json => console.log(json));
            .then(json =>
                endpoint.interface
                    ? this.writeTS(endpoint.fixtureFile, endpoint.interface, json)
                    : this.writeJSON(endpoint.fixtureFile, json)
            )
            .then(() => this.logInternally(`[OK] ${endpoint.url}`))
            .catch((error) => this.logInternally(`[ERROR] ${endpoint.url}: ${error}`));
    }

    writeJSON(filename: string, json: any): void {
        // remove last argument for non-formatted representation (see https://www.npmjs.com/package/jsonfile)
        jsonfile.writeFileSync(`${this.OUT_DIR}/${filename}.fixture.json`, json, {spaces: 2} as WriteFileOptions);
    }

    writeTS(filename: string, model: string, json: any): void {
        const template = ` // auto-generated file - do not change manually
        import { ${model} } from '${this.INTERFACE_DIR}/${filename}.model';
        
        export default (): ${model} => {
          return ${JSON.stringify(json, null, 2)}
        };
        `;

        fs.writeFileSync(`${this.OUT_DIR}/${filename}.fixture.ts`, template);
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

}

console.log('Fetching data from endpoints...');
MockGenerator.run().then(() => console.log('Finished!'));
