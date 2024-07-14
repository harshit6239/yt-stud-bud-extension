import { markdown } from 'markdown'
import './style.css'

async function getNotes() {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let url = new URL(tab.url);
  console.log(url);
  if(url.hostname != "www.youtube.com"){
    document.getElementById('content').textContent = "This extension only works on youtube.com";
    return;
  }
  let vid = url.searchParams.get('v');
  if(!vid) {
    document.getElementById('content').textContent = "open a video to see notes";
    return;
  }
  chrome.runtime.sendMessage({action: 'getNotes', data:{vid}}).then(response => {
    if(response.error) {
      document.getElementById('content').textContent = response.error;
    } else {
      // console.log(response);
      if(response.notes.length == 0) {
        document.getElementById('content').textContent = "No notes found";
        return;
      }
      else if(response.notes.length == 1) {
        let goToBtn = document.createElement('button');
        goToBtn.textContent = "edit notes";
        goToBtn.addEventListener('click', function(event) {
          event.preventDefault();
          chrome.tabs.create({url: `http://localhost:5173/editor/${response.notes[0]._id}`});
        });
        let content = markdown.toHTML(response.notes[0].markdown);
        document.getElementById('content').innerHTML = content;
        document.getElementById('content').insertBefore(goToBtn, document.getElementById('content').firstChild);
        return;
      }
      // document.getElementById('content').textContent = response.data;
    }
  });
}

chrome.storage.sync.get(['token', 'login'], function(data) {
  if(data.token && data.login) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('note').style.display = 'flex';
    getNotes();
  }
});

document.getElementById('loginBtn').addEventListener('click', function(event) {
  event.preventDefault();
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  // console.log(email, password);
  if(!email || !password) {
    document.getElementById('error').textContent = 'Email and password are required';
    return;
  }
  chrome.runtime.sendMessage({action: 'login', data:{email,password}}).then(response => {
    if(response.error) {
      document.getElementById('error').textContent = response.error;
    } else {
      document.getElementById('error').textContent = "";
      document.getElementById('login').style.display = 'none';
      document.getElementById('note').style.display = 'flex';
    }
  });
});

document.getElementById('logOutBtn').addEventListener('click', function(event) {
  event.preventDefault();
  chrome.runtime.sendMessage({action: 'logout'}).then(response => {
    document.getElementById('login').style.display = 'block';
    document.getElementById('note').style.display = 'none';
  });
});

