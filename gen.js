/* generate offtext format*/
import {nodefs,writeChanged,readTextContent, readTextLines} from 'ptk/nodebundle.cjs';
import {parseFootNoteInSource,parseSourceComment,parseShiyi} from './src/moeformat.js'
import {hotfixes} from './src/idiom-hotfix.js'
import {Missing} from './src/missing.js';//原始檔沒有，網站有，補上

await nodefs;
const CY={}
const srcfn='raw/dict_idioms.tsv';
const skips=[354];//含沙射影 完全重覆


const hotfix=(idiom,fields)=>{
    const fixes=hotfixes[idiom];
    if (!fixes)return;
    for (let i=0;i<fixes.length;i++) {
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
        sourcecontent=sourcecontent.replace(/此處所列為「[^」]+」之典源，提供參考。/,'')
        sourceexplain=sourceexplain.replace(/此處所列為「[^」]+」之典故說明，提供參考。/,'')
        parseSourceComment(sourcecomment,notes,idiom)
        if (CY[idiom]) {
            console.log("REPEATED",idiom)
        } else {
            CY[idiom]={id,idiom,shiyi,referBy:[],notes};
            
            if (sourcebook&&sourcebook.length) CY[idiom].sourcebook=sourcebook;
            if (sourcecontent&&sourcecontent.length) CY[idiom].sourcecontent=sourcecontent;
            if (sourceexplain&&sourceexplain.length) CY[idiom].sourceexplain=sourceexplain;
            if (sourcerefer&&sourcerefer.length) CY[idiom].sourcerefer=sourcerefer;
            if (reference&&reference.length) CY[idiom].reference=reference;
            if (sourcerefer&&sourcerefer.length) CY[idiom].sourcerefer=sourcerefer;

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
        const {idiom,shiyi,sourcecontent}=CY[key];
        const m1=shiyi.match(/見「([^」]+)」/);
        const m=(sourcecontent||'').match(/此處所列為「([^」]+)」之典源，提供參考。/)
        if (m&&m1) {
            if (m[1]!==m1[1]) console.log('inconsistent',idiom,m[1],m1[1])
        } else {
            if (m&&!m1) console.log('missing 見',idiom)
            if (m1&&!m){
                if (!CY[m1[1]]) {
                    console.log(idiom,m1[1])
                } else CY[m1[1]].referBy.push(idiom)
            } 
        }

    }
}


gen(readTextLines(srcfn))
writeChanged('idioms.json',JSON.stringify(CY,'',' '),true);