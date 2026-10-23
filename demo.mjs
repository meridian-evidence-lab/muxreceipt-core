import {readFile} from 'node:fs/promises';
import {audit} from './index.mjs';
console.log(JSON.stringify(audit(JSON.parse(await readFile(new URL('./sample.json',import.meta.url),'utf8'))),null,2));
