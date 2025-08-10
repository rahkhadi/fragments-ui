// fragments-ui/src/app.js
import { signIn, getUser } from './auth';
import {
  getUserFragments,
  createTextFragment,
  createImageFragment,
  deleteFragment,
  updateTextFragment,
  openFragmentWithAuth,
} from './api.js';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const form = document.querySelector('#fragment-form');
  const result = document.querySelector('#result');
  const fragmentsList = document.querySelector('#fragments-list');
  const typeSelect = document.querySelector('#fragment-type');
  const textArea = document.querySelector('#fragment-content');

  let fileInput;

  const ensureFileInput = () => {
    if (fileInput) return fileInput;
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fragment-file';
    fileInput.accept = 'image/png,image/jpeg,image/webp,image/gif';
    fileInput.style.display = 'none';
    textArea.insertAdjacentElement('afterend', fileInput);
    return fileInput;
  };

  const toggleInputs = () => {
    const type = typeSelect.value;
    if (type.startsWith('image/')) {
      ensureFileInput();
      textArea.style.display = 'none';
      fileInput.style.display = '';
    } else {
      if (fileInput) fileInput.style.display = 'none';
      textArea.style.display = '';
    }
  };

  typeSelect.addEventListener('change', toggleInputs);
  loginBtn.onclick = () => signIn();

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;
  toggleInputs();

  const renderList = async () => {
    fragmentsList.innerHTML = '<h3>Your Fragments:</h3>';
  
    const data = await getUserFragments(user, true);
    const items = (data?.fragments || [])
      // newest first
      .sort((a, b) => {
        const bu = new Date(b.updated || b.created || 0).getTime();
        const au = new Date(a.updated || a.created || 0).getTime();
        return bu - au;
      });
  
    if (!items.length) {
      fragmentsList.insertAdjacentHTML('beforeend', '<p><em>No fragments yet.</em></p>');
      return;
    }
  
    const ul = document.createElement('ul');
  
    items.forEach((f) => {
      const li = document.createElement('li');
      li.style.marginBottom = '0.75rem';
  
      const meta = document.createElement('pre');
      meta.textContent = JSON.stringify(f, null, 2);
      li.appendChild(meta);
  
      const actions = document.createElement('div');
  
      // Delete
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async () => {
        try { await deleteFragment(user, f.id); await renderList(); }
        catch (e) { alert(`Delete failed: ${e.message}`); }
      };
      actions.appendChild(delBtn);
  
      // Update (text & json)
      if (f.type.startsWith('text/') || f.type === 'application/json') {
        const updBtn = document.createElement('button');
        updBtn.style.marginLeft = '0.5rem';
        updBtn.textContent = 'Update';
        updBtn.onclick = async () => {
          const newVal = prompt('New content (raw text; for JSON paste valid JSON):');
          if (newVal == null) return;
          let body = newVal;
          let putType = f.type;
          if (f.type === 'application/json') {
            try { body = JSON.stringify(JSON.parse(newVal)); }
            catch { alert('Invalid JSON'); return; }
          }
          try { await updateTextFragment(user, f.id, body, putType); await renderList(); }
          catch (e) { alert(`Update failed: ${e.message}`); }
        };
        actions.appendChild(updBtn);
      }
  
      // Conversions (authorized)
      const conv = document.createElement('span');
      conv.style.marginLeft = '0.5rem';
      const addConv = (label, path) => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = label;
        a.style.marginLeft = '0.5rem';
        a.onclick = async (e) => {
          e.preventDefault();
          try { await openFragmentWithAuth(user, path); }
          catch (err) { alert(`Conversion failed: ${err.message}`); }
        };
        conv.appendChild(a);
      };
  
      // --- FULL text conversions ---
      if (f.type === 'text/plain') {
        addConv('Convert → HTML', `/v1/fragments/${f.id}.html`);
        addConv('Convert → Markdown', `/v1/fragments/${f.id}.md`);
        addConv('Convert → Text', `/v1/fragments/${f.id}.txt`); // passthrough
      }
      if (f.type === 'text/html') {
        addConv('Convert → Markdown', `/v1/fragments/${f.id}.md`);
        addConv('Convert → Text', `/v1/fragments/${f.id}.txt`);
        addConv('Convert → HTML', `/v1/fragments/${f.id}.html`); // passthrough
      }
      if (f.type === 'text/markdown') {
        addConv('Convert → HTML', `/v1/fragments/${f.id}.html`);
        addConv('Convert → Text', `/v1/fragments/${f.id}.txt`);
        addConv('Convert → Markdown', `/v1/fragments/${f.id}.md`); // passthrough
      }
  
      // JSON download
      if (f.type === 'application/json') {
        addConv('Download → JSON', `/v1/fragments/${f.id}.json`);
      }
  
      // Image conversions
      if (f.type === 'image/png') {
        addConv('→ JPEG', `/v1/fragments/${f.id}.jpg`);
        addConv('→ WebP', `/v1/fragments/${f.id}.webp`);
      } else if (f.type === 'image/jpeg') {
        addConv('→ PNG', `/v1/fragments/${f.id}.png`);
        addConv('→ WebP', `/v1/fragments/${f.id}.webp`);
      } else if (f.type === 'image/webp') {
        addConv('→ PNG', `/v1/fragments/${f.id}.png`);
        addConv('→ JPEG', `/v1/fragments/${f.id}.jpg`);
      }
  
      if (conv.childElementCount) actions.appendChild(conv);
  
      li.appendChild(actions);
      ul.appendChild(li);
    });
  
    fragmentsList.innerHTML = '';
    fragmentsList.appendChild(ul);
  };  

  await renderList();

  // Create
  form.onsubmit = async (e) => {
    e.preventDefault();
    const type = typeSelect.value;

    try {
      let created;
      if (type.startsWith('image/')) {
        ensureFileInput();
        if (!fileInput.files || !fileInput.files[0]) {
          result.innerText = '❌ Please choose an image file.';
          return;
        }
        created = await createImageFragment(user, fileInput.files[0]);
      } else {
        let body = textArea.value || '';
        if (type === 'application/json') {
          try { body = JSON.stringify(JSON.parse(body)); }
          catch { result.innerText = '❌ Invalid JSON.'; return; }
        }
        created = await createTextFragment(user, body, type);
      }
      result.innerText = `✅ Created: ${created.location}`;
      textArea.value = '';
      if (fileInput) fileInput.value = '';
      await renderList();
    } catch (err) {
      result.innerText = `❌ Failed to create fragment. ${err.message}`;
    }
  };
}

addEventListener('DOMContentLoaded', init);
