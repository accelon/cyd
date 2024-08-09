/*

曲突徙薪 缺 內文注標記
*/
export const parseFootNoteInSource=(str,notes,idiom)=>{
    return str.replace(/\n?\*(\d+)\*(.*)\n?/g,(m,id,caption)=>{
        if (notes[caption] && notes[caption].id!==id) { //出現多次而id 不同
            console.log('repeated note',caption,notes[caption],id,idiom)
        }
        notes[caption]={id}
        return '^f'+id+ (caption?('('+caption+')'):'');
    })
}

export const parseSourceComment=(str,notes,idiom)=>{
    const lines=str.split('\n')
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const m=line.match(/^([^：︰:]+)[︰：:]/);
        if (!m) {
            if (line) {
                if (!notes['__extra__']) notes['__extra__']=[];
                notes['__extra__'].push(line);//extra
            }
            continue;
        }
        if (notes[m[1]]) {
            notes[m[1]].note=line.slice(m.length);
        } else {
            console.log(idiom,'note not found',m[1])
        }
    }
}

export const parseShiyi=(shiyi,aname,triangle)=>{
    shiyi=shiyi.replace(/<a name=([^>]+)>　<\/a>/g,(m,m1)=>{
        aname.push(m1)
        return '';
    })
    shiyi=shiyi.replace(/\n?△「([^\n。《\t]+)」/g,(m,m1)=>{
        const items=m1.split(/」[、,，]*「/).filter(it=>!!it)
        triangle.push(...items)
        return '';
    })
    return shiyi;
}

export const parseSourceContent=(idiom,CY)=>{
    if (!CY[idiom]) {
        console.log('no such idiom',idiom)
        return ''
    }
    const {sourcecontent,shiyi}=CY[idiom];
    if (!sourcecontent) return '';
    let contents=(typeof sourcecontent=='string')?[sourcecontent]:sourcecontent;
    for (let i=0;i<contents.length;i++) {
        const m=contents[i].match(/此處所列為「([^」]+)」之典源，提供參考。/)
        const m1=shiyi.match(/見「([^」]+)」/);
        if (m&&m1) {
            if (m[1]!==m1[1]) console.log('inconsistent',idiom,'refer',m[1],'refering',m1[1])
        } else {
            if (m&&!m1) console.log('missing 見',idiom)
            if (m1&&!m){
                const refering=m1[1];
                if (!CY[refering]) {
                    console.log(idiom,m1[1],'not found')
                } else {
                    console.log(refering,idiom)
                    if (!CY[refering].referBy) CY[refering].referBy=[]
                    CY[refering].referBy.push(idiom)
                }
            } 
        }
        contents[i]=contents[i].replace(/此處所列為「([^」]+)」之典源，提供參考。/,'')
    }
    contents=contents.filter(it=>!!it);
    if (!contents.length) return '';
    return contents.length==1?contents[0]:contents;
}

export const parseSourceExplain=(idiom,CY)=>{
    if (!CY[idiom]) {
        console.log('no such idiom',idiom)
        return;
    }
    const explain=CY[idiom].sourceexplain;
    if (!explain) return '';
    let explains=(typeof explain=='string')?[explain]:explain;
    let deletable=false;//重複之典故說明
    for (let i=0;i<explains.length;i++) {
        explains[i]=explains[i].replace(/「([^」]+)」原作「([^」]+)」。?/,(m, norm,ori)=>{
            if (!CY[norm]) {
                if (norm.length>2) console.log('norm idiom not found',norm)
            } else {
                if (CY[norm].ori&& CY[norm].ori!==ori) {
                    console.log(norm,'has original', CY[norm].ori, 'adding',ori )
                }
                CY[norm].ori=ori;    
            }
            return '';
        });
        deletable=deletable||!!explains[i].match(/此處所列為「([^」]+)」之典故說明，提供參考。/)
    }
    if (deletable) {
        return '';
    }
    explains=explains.filter(it=>!!it)
    return explains.length==1?explains[0]:explains;
}

export const parseProof=(lines)=>{
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        line.match
    }
}