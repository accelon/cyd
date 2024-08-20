const idiom_proof={};
import {readTextLines,parsePageBookLine,PagedGroup, readTextContent} from 'ptk/nodebundle.cjs'
const pageds= new PagedGroup();

export const loadproof=(fn)=>{
    const lines=readTextLines(fn);
    for (let i=0;i<lines.length;i++) {
        const [idiom,pgbkln,pin]=lines[i].split(/\t/);
        if (!idiom_proof[idiom]) idiom_proof[idiom]=[];
        let [page,book,lineoff]=parsePageBookLine(pgbkln);
        if (!pageds.exists(book)) {
            pageds.add(book,readTextContent("../cct/off/"+book+".pgd"));
        }
        const paged=pageds.getItem(book);
        const [strfrom,strto]=pin.split('/');//just use strfrom
        const [pagetext]=paged.sliceOfAnchor(page);
        let yid=page;
        if (!lineoff && pin) {
            const pagelines=pagetext.split('\n')
            for (let i=0;i<pagelines.length;i++) {
                const at=pagelines[i].indexOf(strfrom);
                if (~at) {
                    lineoff=i;
                    break;
                }
            }            
        }
        const title=paged.bookTitle(yid);
        const transclusion='^'+yid.replace('y','x')
                    +(lineoff?'.'+lineoff:'')
                    +(title?title:'《出處》');
        console.log(transclusion)
        idiom_proof[idiom].push(transclusion)
    }
    
}
export const getproof=(idiom)=>{
    return idiom_proof[idiom]||[];
}