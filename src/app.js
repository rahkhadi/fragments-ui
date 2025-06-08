// src/app.js

import { signIn, getUser } from './auth';
import { getUserFragments } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  loginBtn.onclick = () => {
    signIn();
  };

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  // New: Call your API to get fragments
  const userFragments = await getUserFragments(user);

  // Later: show userFragments in the UI
}

addEventListener('DOMContentLoaded', init);
