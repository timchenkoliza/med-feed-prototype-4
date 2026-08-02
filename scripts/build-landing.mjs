// Пишет dist/index.html — точку входа со ссылками на обе ленты.
// Нужен только для удобства раздачи всей папки dist; сами страницы автономны.
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
mkdirSync(dist, { recursive: true })

const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Ленты для исследования</title>
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
             font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
             background: #fafafb; color: #17181c; padding: 24px; }
      .wrap { width: 100%; max-width: 390px; }
      h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }
      p { margin: 0 0 20px; color: #6b6c74; font-size: 14px; }
      a { display: block; padding: 16px; margin-bottom: 10px; border: 1px solid #eaeaec; border-radius: 14px;
          background: #fff; color: inherit; text-decoration: none; }
      a:hover { border-color: #d9d9dd; }
      b { display: block; font-size: 16px; }
      span { color: #6b6c74; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Ленты для исследования</h1>
      <p>Прототипы для интервью с врачами. Открывать на мобильном 390×844.</p>
      <a href="./feed-a/"><b>Вариант A — клиническая лента</b><span>Исследования, метаанализы, рекомендации, стандарты, безопасность</span></a>
      <a href="./feed-b/"><b>Вариант B — профессиональная лента</b><span>Фарма, medtech, события, НМО, видео, подкасты, эксперты</span></a>
    </div>
  </body>
</html>
`

writeFileSync(new URL('index.html', `file://${dist}`), html, 'utf8')
console.log('dist/index.html written')
