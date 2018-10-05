import {update} from './state';
import Publisher from './publisher';
import md from './md';
import {html} from 'lit-html';

export async function loadSite(siteName) {
  update({bodyLoaded: false});

  if (state.siteName === siteName) {
    return;
  }

  if (window.location.pathname !== `/${siteName}`) {
    history.pushState(null, null, `/${siteName}`);
  }

  let existingBody = '';

  try {
    const response = await fetch(`https://${siteName}.firebaseapp.com/index.md`, {method: 'GET'});
    if (response.status === 200) {
      existingBody = await response.text();
    }
  } catch (e) {
    console.log('Fetch of existing content failed, using default text.');
  }

  update({bodyLoaded: true, body: existingBody, siteName});
}

export async function updateSite(state, src) {
  update({body: src, deploying: true});
  const p = new Publisher(state.accessToken, state.siteName, {
    headers: [
      {
        glob: "/index.md",
        headers: {
          'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=0'
        }
      }
    ]
  });

  p.put('/index.md', src);
  p.put('/index.html', md(src));
  try {
    await p.publish();
  } catch(e) {
    update({
      deploying: false,
      errorMessage: e.message,
    });
    return;
  }
  update({
    deploying: false,
    successMessage: html`Deploy succeeded! <a target="_blank" href="https://${state.siteName}.firebaseapp.com">Visit the Site</a>`
  });
}
