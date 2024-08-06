const replaceEntity=(str,entities,rowid,ncell)=>{
	str=str.replace(/&#13;&#10;/g,'\n').replace(/&#10;/g,'\n')
	.replace(/&#10;/g,'\n').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
	.replace(/&quot;/g,"")
	.replace(/&amp;/g,'&')
	str=str.replace(/&([^;]+);/g,(m,m1)=>{
		const repl=entities[m1]
		if (!repl) {
			console.log(m1,rowid,ncell,'unknown entity')
			return '^<'+m1+'>';
		} else {
			return repl;
		}
	})
	return str;
}
export const parseRowContent=(content,entities,nrow)=>{
	const out=[]
	let at=content.indexOf("<table:table-cell");
	while (~at) {
		const tagend=content.indexOf(">",at);
		if (content.charAt(tagend-1)=='/') { //null element
			const tag=content.slice(at,tagend);
			const m=tag.match(/table:number-columns-repeated="(\d+)"/)
			if (m) for (let i=0;i<parseInt(m[1]);i++)out.push('');
			else out.push('');
			at=at+1;
		} else {
			const at2=content.indexOf("</table:table-cell",at);
			const cellcontent=content.slice(at,at2);
			const t=cellcontent.replace(/<\/text:p><text:p>/g,'\\n').replace(/<[^>]+>/g,'');
			const t2=replaceEntity(t.trim(),entities,nrow,out.length);
			out.push(t2)
			at=at2+1;
		}
		at=content.indexOf("<table:table-cell",at)
	}
	return out;
}
export const fromOpenDocumentXML=(content,entities, idfield=0)=>{
	const entries=[];
	let nrow=0;
	console.log('tim')
	// content=content.replace(/\n/g,'')
	let at=content.indexOf("<table:table-row");
	while (~at) {
		let  at2=content.indexOf(">",at);
		at2=content.indexOf("</table:table-row",at2);
		const rowcontent=content.slice(at,at2);
		const row=parseRowContent(rowcontent,entities,nrow);
		entries.push(row.join('\t'));
		at=content.indexOf("<table:table-row",at2)
		nrow++;
	}
	return entries;
}

export const fromExcelXML=(content,entities, idfield=0)=>{
	const entries=[];
	const cols=parseInt(content.match(/ss:ExpandedColumnCount="(\d+)"/)[1]);
	content.replace(/<Row[^>]*>(.+?)<\/Row>/g,(m0,rowdata)=>{
		let cellcount=0;
		let row=[],id, fieldidx=0;
		rowdata.replace(/<Cell([^>]*)>(.+?)<\/Cell>/g,(m,ssindex,m1)=>{
			if (ssindex) {
				const at=ssindex.indexOf('ss:Index');
				if (at>0) {
					cellcount=parseInt(ssindex.slice(11))-1;
				}
			}

			m1=m1.replace(/<[^>]+>/g,'');
			if (cellcount==idfield) {
				//entries.push(row);
				// if (id &&parseInt(m1).toString()!==m1) {
				// 	console.log('wrong id',m1,'prev',id)
				// }
				id=m1;
			} 
			const cell=replaceEntity(m1,entities,id,cellcount %cols)||'';
			row[cellcount]=cell.trim();
			cellcount++;
		});
		// if (row.length!==cols) {
		// 	console.log('wrong ending data',row.length,cols)
		// } else 
		entries.push(row)
	})
	return entries;
}

export const fromSpreadSheetXML=(content,entities,idfield)=>{
	if (~content.indexOf("microsoft")) {
		return fromExcelXML(content,entities,idfield)
	} else {
		return fromOpenDocumentXML(content,entities,idfield)

	}
}