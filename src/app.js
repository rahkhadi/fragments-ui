import { signIn, getUser } from './auth';
import { getUserFragments, createFragment } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const form = document.querySelector('#fragment-form');
  const result = document.querySelector('#result');

  loginBtn.onclick = () => signIn();

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  // Optional: fetch existing fragments
  await getUserFragments(user);

  // ✅ Handle form submit to create fragment
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
