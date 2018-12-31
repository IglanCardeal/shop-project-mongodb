const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const userName = document.querySelector('[data="user-name"]');
const userEmail = document.querySelector('[data="user-email"]');
const url = window.location + 'admin/postUserData';
const ajax = new XMLHttpRequest();

userName.innerHTML = 'carregando';
userEmail.innerHTML = 'carregando';

ajax.open('POST', url);

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

document.addEventListener('DOMContentLoaded', () => {
  ajax.send();
  ajax.addEventListener('readystatechange', () => {
    const requestSuccess = Boolean(ajax.status === 200 && ajax.readyState === 4);
    if (requestSuccess) {
      const { username, email } = JSON.parse(ajax.responseText);
      userName.innerHTML = username;
      userEmail.innerHTML = email;
      return;
    }
  });
});