/* create ptk source file */
import {nodefs, readTextContent, unique, writeChanged} from 'ptk/nodebundle.cjs'
import {parseProof} from './src/moeformat.js'
await nodefs;
const CY=JSON.parse( readTextContent("raw/idioms.json"))

/*
   orth : 標準形態（不一定和語本一致）

*/
const DEFINATION=[];//key: orth,      標準形態-釋義,  原意，語本，用法，只收 常用體(解釋出處)
const SOURCES={};//key: 出處名+orth 帶腳注的原文，連到
const LEXICON=["^:[name=idiomlexicon]\t原形\t同義\t反義\t參考"];//key: 詞形, orth, 同義, 反義, 參考
const PROOFS={};//key 出處名+idiom 
const dictionary={}//所有出現過的詞都有key
const BOOKS={};
for (let idiom in CY) {
    dictionary[idiom]={ori:'',synonym:[],antonym:[],references:[]};
}
//如果無此key ，增加到dictionary，增將 field 填入 idom
const addDictionary=(keys,idiom,field)=>{
    for (let i=0;i<keys.length;i++) {
        const key=keys[i];
        if (!dictionary[key]) dictionary[key]={ori:'',synonym:[],antonym:[],references:[]};
        try {
            dictionary[key][field].push(idiom);
        } catch(e) {
            console.log('field',field,keys,dictionary[key],idiom)
        }
        
    }    
}

for (let idiom in CY) {
    let {shiyi,sourcecontent,sourcebook,sourceexplain,notes,
        reference, triangle, synonym,antonym,aname,proof,ori,
    } =  CY[idiom];
    let references=[]
    if (reference) references.push(...reference)
    if (triangle) references.push(...triangle)
    if (aname) references.push(...aname)

    //移除已經在  同義、反義的
    for (let i=0;i<references.length;i++) {
        if (synonym&&~synonym.indexOf(references[i]))references[i]=''
        if (antonym&&~antonym.indexOf(references[i]))references[i]=''
        if (ori==references[i])references[i]=''
        if (idiom==references[i])references[i]=''
    }
    references=unique(references.filter(it=>!!it));

    if (references) addDictionary(references,idiom,"references");
    if (synonym) addDictionary(synonym,idiom,"synonym");
    if (antonym) addDictionary(antonym,idiom,"antonym");
   
    dictionary[idiom]={ori,synonym:synonym||[],antonym:antonym||[],references};

    
    shiyi=shiyi.replace(/\n/g,'')
    shiyi=shiyi.replace(/[＃◎※]*?[典語]或?[出本][^《〈]{0,10}[《〈][^》〉]+[》〉][^》〉。]{0,5}。?/g,'');
    shiyi=shiyi.replace(/後亦?用「[^」]+」/,'');
    if (~shiyi.indexOf('「'+idiom+'」')) shiyi=shiyi.replace('「'+idiom+'」','')

    if (sourcecontent) {//是orth
        DEFINATION.push(idiom+'\t'+shiyi);
    } else { //

    }

    if (sourcebook) {
        const sourcebooks=typeof sourcebook=='string'?[sourcebook]:sourcebook;
        for (let i=0;i<sourcebooks.length;i++) {
            const m=sourcebooks[i].match(/《([^》．]+).*》/);
            const book=m?m[1]:sourcebooks[i];
            if (!BOOKS[book])BOOKS[book]={idioms:[],contents:[]}
            if (!~BOOKS[book].idioms.indexOf(idiom)) {
                BOOKS[book].idioms.push(idiom)
                BOOKS[book].contents.push(sourcecontent)    
            }
        }
    }
}
const genLexicon=()=>{
    for (let idiom in dictionary) {
        const d=dictionary[idiom];
        LEXICON.push(idiom+'\t'+(d.ori||'')+'\t'+d.synonym+'\t'+d.antonym+'\t'+d.references);
    }
    writeChanged('off/lexicon.tsv',LEXICON.join('\n'),true)
}
genLexicon()

const morethanone=[];
for (let book in BOOKS) {
    // if (BOOKS[book].idioms.length>1) {
        morethanone.push(book+'\t'+BOOKS[book].idioms.length+'\t'+BOOKS[book].idioms.join(',')
    
        //+'\t'+BOOKS[book].contents.join('\t'))
     );
    // }
}

writeChanged('off/shiyi.tsv',DEFINATION.join('\n'),true)
writeChanged('book2contents.off',morethanone.join('\n'),true)
