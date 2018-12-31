const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const userName = document.querySelector('[data="user-name"]');
const userEmail = document.querySelector('[data="user-email"]');

userName.innerHTML = 'carregando';
userEmail.innerHTML = 'carregando';

const backdropClickHandler = () => {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

const menuToggleClickHandler = () => {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

const initAjax = () => {
  const url = '/admin/postUserData';
  const ajax = new XMLHttpRequest();
  ajax.open('POST', url);
  ajax.send();
  ajax.addEventListener('readystatechange', () => {
    const requestSuccess = Boolean(ajax.status === 200 && ajax.readyState === 4);
    if (requestSuccess) {
      const { username, email } = JSON.parse(ajax.responseText);
        // timeout apenas para teste
      // setTimeout(() => { 
      //   userName.innerHTML = username;
      //   userEmail.innerHTML = email;
      // }, '3000');
      userName.innerHTML = username;
      userEmail.innerHTML = email;
      return;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  backdrop.addEventListener('click', backdropClickHandler);
  menuToggle.addEventListener('click', menuToggleClickHandler);
  initAjax();
});