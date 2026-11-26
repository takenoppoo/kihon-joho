from playwright.sync_api import sync_playwright
U='file:///home/claude/kihon/index.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U+'#test');pg.reload()
    pg.click('.chk');print('weak on',pg.inner_text('#navweak'))
    pg.click('.ch >> nth=0');pg.click('text=解答する');pg.screenshot(path='/tmp/c1.png')
    r=pg.inner_text('.result');print(r)
    pg.goto(U+'#weak');pg.reload();print(pg.inner_text('.list li >> nth=0')[:20])
    pg.click('text=苦手だけ解く');print(pg.inner_text('h1'))
    pg.click('.chk');pg.goto(U+'#weak');pg.reload();print('after off:',pg.inner_text('.card'))
    pg.goto(U+'#top');pg.reload();print(pg.inner_text('.btns').replace('\n',' | '),errs)
    b.close()
