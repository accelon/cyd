import {nodefs,writeChanged,readTextContent} from 'ptk/nodebundle.cjs';
import {fromSpreadSheetXML} from './src/spreadsheetxml.js'
import {entities} from './src/idiom-entity.js'
await nodefs;
const srcdir='raw/';
let entries;
const srcfn=process.argv[2]|| 'dict_idioms_2020_20240627.xml'
if (srcfn.endsWith('.xml')) {
	const raw=readTextContent(srcdir+srcfn);
	entries=fromSpreadSheetXML(raw,entities);
	console.log(entries.shift())
} else throw "only support and xml";

writeChanged('dict_idioms.tsv',entries.join('\n'),true)