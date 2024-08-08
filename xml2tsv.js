import {nodefs,writeChanged,readTextContent} from 'ptk/nodebundle.cjs';
import {fromSpreadSheetXML} from './src/spreadsheetxml.js'
import {entities} from './src/idiom-entity.js'
import {PUA2HZPX} from './src/idiom-pua.js'

await nodefs;
const srcdir='raw/';
let entries;
const srcfn=process.argv[2]|| 'dict_idioms_2020_20240627.xml'
if (srcfn.endsWith('.xml')) {
	const raw=readTextContent(srcdir+srcfn).replace(/([\uE000-\uFAD9])/g,(m,m1)=>{
		const ic=m1.charCodeAt(0).toString(16);
		if (PUA2HZPX[ic]) {
			let t=PUA2HZPX[ic]
			return (t.length>2)?('‵'+t+'′'):t;// hzpx包起來
		} else {
			return '0x'+ic+';'
		}
	});
	
	entries=fromSpreadSheetXML(raw,entities);
	//console.log(entries.shift())
} else throw "only support and xml";

writeChanged('raw/dict_idioms.tsv',entries.join('\n'),true)
