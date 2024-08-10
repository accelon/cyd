/* generate offtext format*/
import {nodefs,writeChanged,readTextContent, readTextLines} from 'ptk/nodebundle.cjs';
import {parseFootNoteInSource,parseSourceComment,parseShiyi,
    parseSourceExplain,parseSourceContent,buildnotes} from './src/moeformat.js'
import {hotfixes} from './src/idiom-hotfix.js'
import {Missing} from './src/missing.js';//原始檔沒有，網站有，補上

await nodefs;
const CY={}
const srcfn='raw/dict_idioms.tsv';
const skips=[354];//含沙射影 完全重覆

let yuan=0;
const hotfix=(idiom,fields)=>{
    const fixes=hotfixes[idiom];
    if (!fixes)return;
    for (let i=0;i<fixes.length;i++) {
        if (!fixes[i]) throw idiom+' wrong fix'
        const [fid,from,to]=fixes[i]
        fields[fid]=fields[fid].replace(from,to);
    }
}

const gen=(lines)=>{
    for (let key in Missing) {
        //原始檔缺的主要成語，必須補上
        lines.push(Missing[key].join('\t'));
    }
    for (let i=1;i<lines.length;i++) {
        if (!skips.indexOf(i))continue;
        const notes={};
        const line=lines[i].replace(/\\n/g,'\n');
        let fields=line.split('\t');
        hotfix(fields[1],fields);
        let [id,idiom,zhuyin,shiyi,sourcebook,sourcecontent,sourcecomment,sourcerefer,sourceexplain,
        //編號,成語,注音,釋義,典源文獻名稱,典源文獻內容,典源-註解,典源-參考,典故說明,
        usage,usagetype,usageexample,
        //用法-語意說明,用法-使用類別,用法-例句,
        proof, regconizesame,regconizediff,regconizeexample,
        //書證,辨識-同,辨識-異,辨識-例句,
        correction,synonym,antonym,reference
        //形音辨誤,近義-同,近義-反,參考成語(正文)
        ]=fields;
        if (!id) continue;
        const aname=[],triangle=[];
        shiyi=parseShiyi(shiyi,aname,triangle);
        sourcebook=parseFootNoteInSource(sourcebook,notes,idiom);
        sourcecontent=parseFootNoteInSource(sourcecontent,notes,idiom);
        parseSourceComment(sourcecomment,notes,idiom)

        if (CY[idiom]) {
            console.log("REPEATED",idiom)
        } else {
            CY[idiom]={id,idiom,shiyi};
            if (~sourcebook.indexOf('\n')) {
                sourcebook=sourcebook.split('\n');
            }
            if (~sourceexplain.indexOf('\n')) {
                sourceexplain=sourceexplain.split(/\n＋?\n?/);
            }
            if (~sourcecontent.indexOf('\n＆\n')||~sourcecontent.indexOf('\n＋\n')) {
                sourcecontent=sourcecontent.split(/\n[＆＋]\n/);
            }
            if (~sourcecomment.indexOf('\n＆\n')||~sourcecomment.indexOf('\n＋\n')) {
                sourcecomment=sourcecomment.split(/\n[＆＋]\n/);
            }
            
            if (usage&&(~usage.indexOf('＆'))) {
                usage=usage.split(/＆/);
            }
            if (usagetype&&(~usagetype.indexOf('＆'))) {
                usagetype=usagetype.split(/＆/);
            }
            if (usageexample&&(~usageexample.indexOf('\n＆\n')||~usageexample.indexOf('\n＋\n'))) {
                usageexample=usageexample.split(/\n[＆＋]\n/);
            }

            if (proof) {
                proof=proof.split(/\n?(\d+\.)/);
                for (let i=0;i<proof.length-1;i++) {
                    if (proof[i].match(/\d+\./)) {
                        proof[i]+=proof[i+1];
                        proof[i+1]='';
                    }
                }
                proof=proof.filter(it=>!!it)
            }

            if (sourcebook&&sourcebook.length) CY[idiom].sourcebook=sourcebook;
            if (sourcecontent&&sourcecontent.length) CY[idiom].sourcecontent=sourcecontent;
            if (sourceexplain&&sourceexplain.length) CY[idiom].sourceexplain=sourceexplain;
            if (sourcerefer&&sourcerefer.length) CY[idiom].sourcerefer=sourcerefer;
            if (Object.keys(notes).length) {
                CY[idiom].sourcenotes=buildnotes(notes); 
            }

            if (reference&&reference.length) CY[idiom].reference=reference.split(/[，、,]/);

            if (triangle.length) CY[idiom].triangle=triangle;
            if (aname.length) CY[idiom].aname=aname;
            if (synonym&&synonym.length) CY[idiom].synonym=synonym.split(/[、，,]/);
            if (antonym&&antonym.length) CY[idiom].antonym=antonym.split(/[、，,]/);

            if (usage&&usage.length) CY[idiom].usage=usage;
            if (usagetype&&usagetype.length) CY[idiom].usagetype=usagetype;
            if (usageexample&&usageexample.length) CY[idiom].usageexample=usageexample;
            
            if (proof&&proof.length) CY[idiom].proof=proof;

            if (regconizesame&&regconizesame.length) CY[idiom].regconizesame=regconizesame;
            if (regconizediff&&regconizediff.length) CY[idiom].regconizediff=regconizediff;
            if (regconizeexample&&regconizeexample.length) CY[idiom].regconizeexample=regconizeexample;
            if (correction&&correction.length) CY[idiom].correction=correction;
          }
        //if (i==2) console.log(id,idiom,reference)
    }

    //second phase
    for (let key in CY) {
        const {shiyi}=CY[key];
        if(CY[key].sourcecontent) CY[key].sourcecontent=parseSourceContent(key,CY)
        if(CY[key].sourceexplain) CY[key].sourceexplain=parseSourceExplain(key,CY);
        if (!CY[key].sourcecontent) delete CY[key].sourcecontent
        if (!CY[key].sourceexplain) delete CY[key].sourceexplain
    }
}
gen(readTextLines(srcfn))

writeChanged('raw/idioms.json',JSON.stringify(CY,'',' '),true);

for (let key in CY) {
    //if (CY[key].sourcebook) console.log(CY[key].sourcebook)
}