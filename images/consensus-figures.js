/* Small, independent controls for the figures in the untraceable-consensus post. */
(() => {
  'use strict';
  const transfer = document.getElementById('uc-transfer');
  const bounds = document.getElementById('uc-bounds');
  const grid = document.getElementById('uc-grid');
  if (!transfer || !bounds || !grid) return;

  const state = { mode: 'luat', alice: 'pending', bob: 'pending', order: [], play: 0 };
  const tq = selector => transfer.querySelector(selector);
  function transferPaint() {
    transfer.querySelectorAll('[data-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
    });
    for (const who of ['alice', 'bob']) {
      const status = tq(`[data-status="${who}"]`);
      const value = state[who];
      status.textContent = value === 'pending' ? 'Pending' : value === 'committed' ? 'Committed' : 'Failed';
      status.className = 'uc-status' + (value === 'pending' ? '' : ' uc-' + value);
    }
    transfer.querySelectorAll('[data-shared]').forEach(account => {
      account.classList.toggle('uc-replaced', state.mode === 'cuat' && state.order.length > 0);
    });
    let message;
    if (state.order.length === 0) message = 'Choose a design and play either order.';
    else if (state.order.length === 1) message = state.mode === 'luat'
      ? 'The first transfer committed and added a nullifier. Decoy c is still available.'
      : 'The first transfer committed and replaced c. The other transfer still names the old c.';
    else message = state.mode === 'luat'
      ? 'Both transfers committed. They spend different accounts; sharing c as a decoy causes no conflict.'
      : `${state.order[0] === 'alice' ? 'Alice' : 'Bob'} committed. The other transfer failed because it named the old version of c.`;
    tq('[data-readout]').textContent = message;
  }
  function transferReset(mode = state.mode) {
    state.play += 1;
    state.mode = mode;
    state.alice = 'pending'; state.bob = 'pending'; state.order = [];
    transfer.querySelectorAll('[data-action="play"], [data-action="reverse"]').forEach(button => button.disabled = false);
    transferPaint();
  }
  function attempt(who) {
    if (state[who] !== 'pending') return;
    state[who] = state.mode === 'cuat' && state.order.length ? 'failed' : 'committed';
    state.order.push(who);
    transferPaint();
  }
  function transferPlay(first) {
    transferReset();
    const version = state.play;
    transfer.querySelectorAll('[data-action="play"], [data-action="reverse"]').forEach(button => button.disabled = true);
    window.setTimeout(() => { if (version === state.play) attempt(first); }, 350);
    window.setTimeout(() => { if (version === state.play) attempt(first === 'alice' ? 'bob' : 'alice'); }, 1450);
    window.setTimeout(() => {
      if (version === state.play) transfer.querySelectorAll('[data-action="play"], [data-action="reverse"]').forEach(button => button.disabled = false);
    }, 1850);
  }
  transfer.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => transferReset(button.dataset.mode)));
  tq('[data-action="play"]').addEventListener('click', () => transferPlay('alice'));
  tq('[data-action="reverse"]').addEventListener('click', () => transferPlay('bob'));
  tq('[data-action="reset"]').addEventListener('click', () => transferReset());
  transferPaint();

  const bq = selector => bounds.querySelector(selector);
  function primePower(n) {
    if (n < 2) return false;
    for (let p = 2; p <= n; p++) {
      if (n % p) continue;
      let prime = true;
      for (let d = 2; d * d <= p; d++) if (p % d === 0) prime = false;
      if (!prime) continue;
      let quotient = n;
      while (quotient % p === 0) quotient /= p;
      if (quotient === 1) return true;
    }
    return false;
  }
  function boundsPaint() {
    const lambda = Number(bq('#uc-lambda').value);
    const one = lambda * lambda - lambda + 1;
    const many = lambda * lambda;
    bq('[data-lambda]').value = lambda;
    bq('[data-one]').textContent = one;
    bq('[data-many]').textContent = many;
    bq('[data-bar="luat"]').style.width = `${200 / many}%`;
    bq('[data-bar="one"]').style.width = `${100 * one / many}%`;
    bq('[data-bar="many"]').style.width = '100%';
    bq('[data-chart]').setAttribute('aria-label', `At lambda ${lambda}, LUAT is 2, the CUAT one-round upper bound is ${one}, and the multi-round value in our model is ${many}`);
    const oneDetail = primePower(lambda - 1)
      ? `A projective plane reaches the one-round upper bound of ${one}.`
      : lambda === 2 ? `The one-round upper bound is ${one}.`
      : `The one-round upper bound is ${one}; a cyclic construction reaches at least ${Math.floor(lambda * lambda / 2)}.`;
    bq('[data-readout]').textContent = `For λ = ${lambda}, ${oneDetail} Several rounds reach ${many}.`;
  }
  bq('#uc-lambda').addEventListener('input', boundsPaint);
  boundsPaint();

  const gstate = { stage: 9, step: 4, row: 2, col: 3 };
  const gq = selector => grid.querySelector(selector);
  const indexedLabel = (name, index) => `${name}<sub>${index}</sub>`;
  const processLabel = (name, row, col) => `${name}<sub>${row},${col}</sub>`;
  const columnOwner = (row, col) => row !== col && (gstate.stage === 9 || row === col % 3 + 1);
  function gridPaint() {
    grid.dataset.step = String(gstate.step);
    const columns = gstate.stage === 6 ? 1 : 2;
    grid.querySelectorAll('[data-stage]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.stage) === gstate.stage)));
    grid.querySelectorAll('button[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === gstate.step)));
    grid.querySelectorAll('[data-reveal]').forEach(panel => { panel.hidden = Number(panel.dataset.reveal) > gstate.step; });
    grid.querySelectorAll('[data-row]').forEach(button => {
      button.disabled = gstate.step < 2;
      button.setAttribute('aria-pressed', String(gstate.step >= 2 && Number(button.dataset.row) === gstate.row));
      button.setAttribute('aria-label', `Select row ${button.dataset.row}: one process, P${button.dataset.row},${button.dataset.row}`);
    });
    grid.querySelectorAll('[data-col]').forEach(button => {
      const col = Number(button.dataset.col);
      const owners = [1, 2, 3].filter(row => columnOwner(row, col));
      button.querySelector('.uc-axis-processes').innerHTML = owners.map(row => `<span>${processLabel('Q', row, col)}</span>`).join('');
      button.disabled = gstate.step < 3;
      button.setAttribute('aria-pressed', String(gstate.step >= 3 && col === gstate.col));
      button.setAttribute('aria-label', `Select column ${col}: ${columns === 1 ? 'one process' : 'two processes'}, ${owners.map(row => `Q${row},${col}`).join(' and ')}`);
    });
    grid.querySelectorAll('[data-cell]').forEach(cell => {
      const row = Number(cell.dataset.cell[0]), col = Number(cell.dataset.cell[1]);
      const inRow = gstate.step >= 2 && row === gstate.row;
      const inCol = gstate.step >= 3 && col === gstate.col;
      const owner = cell.querySelector('.uc-owner');
      owner.innerHTML = row === col ? processLabel('P', row, col) : columnOwner(row, col) ? processLabel('Q', row, col) : '—';
      owner.className = 'uc-owner ' + (row === col ? 'uc-owner-row' : columnOwner(row, col) ? 'uc-owner-col' : 'uc-owner-none');
      owner.title = row === col || columnOwner(row, col) ? 'Process that owns this account' : 'No process spends this account in this round; it still serves as a decoy';
      cell.className = 'uc-cell' + (inRow && inCol ? ' uc-meeting' : inRow ? ' uc-in-row' : inCol ? ' uc-in-col' : '');
      if (inRow && inCol) {
        void cell.offsetWidth;
        cell.classList.add('uc-pulse');
      }
    });
    gq('[data-column-group]').innerHTML = `${3 * columns} processes already agree on y<sub>1</sub>`;
    gq('[data-column-count]').textContent = `${columns === 1 ? 'One process' : 'Two processes'} per column masking set.`;
    gq('[data-incidence]').textContent = `Every account: 1 + ${columns} = ${1 + columns} appearances.`;
    gq('[data-unused-note]').hidden = gstate.stage !== 6 || gstate.step < 3;
    const selectedRow = indexedLabel('R', gstate.row);
    const selectedColumn = indexedLabel('C', gstate.col);
    const sharedAccount = indexedLabel('a', `${gstate.row}${gstate.col}`);
    const messages = {
      1: 'Start with nine fresh accounts in a 3 × 3 grid. Each row and each column will be a masking set of three accounts.',
      2: `Three processes have already agreed on y<sub>0</sub>. Each P owns a diagonal account and uses its whole row as a masking set. ${processLabel('P', gstate.row, gstate.row)} uses row ${selectedRow}.`,
      3: `${3 * columns} other processes have already agreed on y<sub>1</sub>. ${columns === 1 ? 'One Q process uses' : 'Two Q processes use'} each column masking set, each owning a different off-diagonal account. Row ${selectedRow} and column ${selectedColumn} share ${sharedAccount}.`,
      4: `Row ${selectedRow} and column ${selectedColumn} share ${sharedAccount}. A successful row transfer invalidates every column transfer, and conversely. Processes in the losing group read a committed transfer and adopt the winning group's value.`
    };
    gq('[data-readout]').innerHTML = messages[gstate.step];
  }
  grid.querySelectorAll('button[data-step]').forEach(button => button.addEventListener('click', () => { gstate.step = Number(button.dataset.step); gridPaint(); }));
  grid.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => { gstate.stage = Number(button.dataset.stage); gridPaint(); }));
  grid.querySelectorAll('[data-row]').forEach(button => button.addEventListener('click', () => { gstate.row = Number(button.dataset.row); gridPaint(); }));
  grid.querySelectorAll('[data-col]').forEach(button => button.addEventListener('click', () => { gstate.col = Number(button.dataset.col); gridPaint(); }));
  gridPaint();

  const valency = document.getElementById('uc-valency');
  if (valency) {
    valency.querySelectorAll('[data-valency]').forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.valency;
      valency.querySelectorAll('[data-valency]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      valency.dataset.chosen = value;
      valency.querySelector('[data-valency-readout]').textContent = `After ${value === '0' ? 'p' : 'q'} takes the next step, the processes decide ${value} in every continuation. The other outcome is no longer possible.`;
    }));
  }

  // The proof details are collapsed on screen; links to them and a printed copy open them.
  const proof = document.getElementById('uc-proof');
  if (proof) {
    const openProof = () => { proof.open = true; };
    document.querySelectorAll('a[href="#uc-proof"]').forEach(link => link.addEventListener('click', openProof));
    if (location.hash === '#uc-proof') openProof();
    window.addEventListener('beforeprint', openProof);
  }
})();
