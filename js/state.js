const state = {};

export {state};
window.state = state;

const cbs = [];
export function update(merge) {
  Object.assign(state, merge);
  cbs.forEach(cb => { cb(state); });
  console.log(state);
  return state;
}

export function onState(cb) {
  cbs.push(cb);
  cb(state);
}
