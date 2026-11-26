from playwright.sync_api import sync_playwright
U='file:///home/claude/kihon/index.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U);pg.reload();print(pg.inner_text('.card').replace('\n',' | '))
    pg.goto(U+'#test-1');pg.reload();pg.click('.chk');pg.click('.ch >> nth=0');pg.click('text=解答する')
    pg.goto(U+'#review-1');pg.reload();print(pg.inner_text('h1'))
    pg.goto(U+'#weak-1');pg.reload();print(pg.inner_text('h1'),'|',pg.inner_text('.list li >> nth=0')[:24])
    pg.click('text=苦手だけ解く');print(pg.inner_text('h1'))
    pg.goto(U);pg.reload();pg.screenshot(path='/tmp/home2.png');print(pg.inner_text('.card').replace('\n',' | '),errs)
    b.close()
