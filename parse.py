import re, json
sec='\n'+open('/tmp/sec.txt').read()
blocks=re.split(r'\n\s*例題 (\d+)\s*\n',sec)
ex={}
for i in range(1,len(blocks),2):
    n=int(blocks[i]); t=blocks[i+1]
    t=re.sub(r'\n\s*\d+\s*\n?$','\n',t.rstrip()+'\n')
    head,expl=t.split('たとえ話の解説',1)
    lines=[l.strip() for l in head.strip().split('\n') if l.strip()]
    q=[];ch=[]
    for l in lines:
        m=re.match(r'^([アイウエ])\s+(.*)$',l)
        if m: ch.append(m.group(2))
        elif ch: ch[-1]+=l
        else: q.append(l)
    # expl sections
    expl=re.sub(r'\n\s*\d+\s*$','',expl.strip())
    parts=re.split(r'\n(問題の趣旨|日常に置き換えると|言葉の意味)\n','\n'+expl)
    d={parts[k]:parts[k+1].strip() for k in range(1,len(parts),2)}
    ex[n]=dict(n=n,q=''.join(q),choices=ch,purpose=d['問題の趣旨'],story=d['日常に置き換えると'],meaning=d['言葉の意味'])
ans={1:'ウ',2:'ア',3:'イ',4:'ウ',5:'エ',6:'ウ',7:'イ',8:'ウ',9:'イ',10:'イ',11:'ア',12:'エ',13:'ア',14:'エ',15:'ウ'}
ref={1:15,2:11,3:1,4:14,5:7,6:6,7:4,8:9,9:8,10:12,11:5,12:2,13:13,14:10,15:3}
out=[]
for m in range(1,16):
    e=ex[ref[m]]
    assert len(e['choices'])==4,(m,e['choices'])
    a='アイウエ'.index(ans[m])
    # verify: explanation final line mentions
    assert ('答えは「'+ans[m]+'」') in e['meaning'],(m,e['meaning'])
    out.append(dict(no=m,ex=ref[m],q=e['q'],choices=e['choices'],ans=a,purpose=e['purpose'],story=e['story'],meaning=e['meaning'],fig=(m==1)))
json.dump(out,open('data.json','w'),ensure_ascii=False,indent=1)
for o in out: print(o['no'],o['ex'],o['q'][:30],o['choices'][o['ans']][:40],'|',o['meaning'].split('\n')[-1][:50])
