import {markdown} from 'markdown';

export default function md(src) {
  const html = markdown.toHTML(src);
  const match = html.match(/<h1>(.*)<\/h1>/i);
  const title = match ? `${match[1]} - a TinyPage` : 'My TinyPage';

  return `
<!doctype html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body {
      padding: 0;
      font-family: 'Fira Mono', monospace;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-height: 100vh;
    }

    a {
      color: black;
    }

    main, footer {
      display: block;
    }

    main {
      margin: 24px auto;
      max-width: 800px;
      flex: 1;
    }

    footer {
      font-size: 11px;
      text-align: center;
      padding: 8px;
    }
  </style>
</head>
<body>
  <main>
    ${html}
  </main>
  <footer>A <a target="_blank" href="https://tiny-page.firebaseapp.com/">TinyPage</a> built with the <a target="_blank" href="https://firebase.google.com/docs/hosting/reference/rest/">Firebase Hosting REST API</a>.</footer>
</body>
`;
}
