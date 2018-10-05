import render from './render';
import {state, onState, update} from './state';
import {initAuth} from './auth';
import {loadSite} from './actions';

async function boot() {

  await initAuth();
  if (window.location.pathname !== '' && window.location.pathname.lastIndexOf('/') === 0) {
    await loadSite(window.location.pathname.substr(1));
  }

  render(state);
  onState(render);
}
boot();
