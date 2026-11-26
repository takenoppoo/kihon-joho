from playwright.sync_api import sync_playwright
U='file:///home/claude/kihon/index.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U);print(pg.inner_text('.card >> nth=1').replace('\n',' | '))
    pg.goto(U+'#study-1');pg.reload();print(pg.locator('.card').count(),pg.locator('.spk').count())
    pg.goto(U+'#test-1');pg.reload();print(pg.inner_text('h1'),pg.inner_text('.meta >> nth=0'))
    pg.click('.chk');pg.click('.ch >> nth=0');pg.click('text=解答する');pg.screenshot(path='/tmp/v1.png')
    pg.goto(U+'#weak');pg.reload();print(pg.inner_text('.list li >> nth=0')[:30])
    pg.goto(U+'#review');pg.reload();print(pg.inner_text('h1'),errs)
    # migrate old keys
    pg.evaluate("localStorage.clear();localStorage.setItem('kihon_sec1_wrong','[3,5]')")
    pg.goto(U);pg.reload();print(pg.inner_text('#navrev'))
    b.close()
