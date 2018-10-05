import { render, html } from 'lit-html';
import { update } from './state';
import Publisher from './publisher';
import {markdown} from 'markdown';

import {loadSite, updateSite} from './actions';

const DEFAULT_TEXT = '';

async function onSignInOut(e, state) {
  e.preventDefault();
  console.log(await state.user ? state.auth.signOut() : state.auth.signIn());
}

function renderPage(state) {
  if (!state.user) {
    return SignInForm(state);
  } else if (!state.siteName) {
    return PickSite(state);
  }
  return UpdateSite(state);
}

function renderForm(state) {
  if (!state.user) { return ''; }

  return html`
    Form
  `;
}

function SignInForm(state) {
  return html`
  <div id="sign-in">
    <p id="about">TinyPage is a demonstration of the <a target="_blank" href="https://firebase.google.com/docs/hosting/reference/rest/">Firebase Hosting REST API</a>. It lets you deploy some simple rendered Markdown to a Firebase Hosting site entirely from the browser (no servers required!).</p></p>
    <button id="sign-in-btn" @click=${e => state.auth.signIn()}>Sign in with Google</button>
  </div>
  `;
}

function PickSite(state) {
  return html`
  <form id="pick-site" @submit=${e => { e.preventDefault(); loadSite(document.getElementById('pick-site-input').value); }}>
    <div id="pick-site-field">
      <input id="pick-site-input" autofocus placeholder="myapp"><code>.firebaseapp.com</code>
    </div>
    <button type="submit">Load Site</button>
  </form>
  `
}

function UpdateSite(state) {
  return html`
  <h2>editing ${state.siteName}.firebaseapp.com</h2>
  <form id="update-site" @submit=${e => { e.preventDefault(); updateSite(state, document.getElementById('update-site-input').value); }}>
    <textarea autofocus id="update-site-input">${state.body}</textarea>
    <p id="warning"><b>Warning:</b> This will actually, for real, overwrite any content you have on this Firebase Hosting site. Be careful!</p>
    ${state.deploying ? html`<button disabled type="submit">Deploying...</button>` : html`</button><button type="submit">Deploy</button>`}
  </form>
  `
}

function UserBar(state) {
  if (!state.user) { return; }
  return html`
    <p id="user-bar">Signed in as <i>${state.user.email}</i>. <a href="#" @click=${e => { e.preventDefault(); state.auth.signOut() }}>Sign Out</a>.</p>
  `
}

function SuccessMessage(state) {
  if (!state.successMessage) { return; }
  return html`
    <p id="success">${state.successMessage}</p>
  `;
}

function ErrorMessage(state) {
  if (!state.errorMessage) { return; }
  return html`
    <p id="error">${state.errorMessage}</p>
  `;
}

export default function(state) {
render(html`
<header>
  <h1><a href="/">TinyPage</a></h1>
  ${SuccessMessage(state)}
  ${ErrorMessage(state)}
</header>
${renderPage(state)}
${UserBar(state)}

`, document.getElementById('main'))
}
