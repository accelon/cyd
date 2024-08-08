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
    shiyi=shiyi.replace(/\n?△「([^>]+)」/g,(m,m1)=>{
        const items=m1.split(/」[、，]*「/).filter(it=>!!it)
        triangle.push(...items)
        return '';
    })
    return shiyi;
}