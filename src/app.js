import { signIn, getUser } from './auth';
import { getUserFragments, createFragment } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const form = document.querySelector('#fragment-form');
  const result = document.querySelector('#result');
  const fragmentsList = document.querySelector('#fragments-list');

  loginBtn.onclick = () => signIn();

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  // ✅ Fetch existing fragments metadata and render it
  const fragmentsData = await getUserFragments(user);
  if (fragmentsData && fragmentsData.fragments) {
    fragmentsList.innerHTML = '<h3>Your Fragments:</h3>';
    fragmentsData.fragments.forEach(f => {
      const item = document.createElement('pre');
      item.textContent = JSON.stringify(f, null, 2);
      fragmentsList.appendChild(item);
    });
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const content = document.querySelector('#fragment-content').value;
    const response = await createFragment(user, content);

    if (response) {
      result.innerText = `✅ Fragment created!\nLocation: ${response.location}\nMetadata: ${JSON.stringify(response.json, null, 2)}`;
    } else {
      result.innerText = '❌ Failed to create fragment.';
    }
  };
}

addEventListener('DOMContentLoaded', init);
