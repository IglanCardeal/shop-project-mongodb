"use strict";

const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");
const userName = document.querySelector('[data="user-name"]');
const userEmail = document.querySelector('[data="user-email"]');
const mobileUserName = document.querySelector('[data="mobile-user-name"]');

userName.innerHTML = "carregando";
userEmail.innerHTML = "carregando";
mobileUserName.innerHTML = "carregando";

const initAjax = isMobile => {
  const url = "/admin/postUserData";
  const ajax = new XMLHttpRequest();
  ajax.open("POST", url);
  ajax.send();
  ajax.addEventListener("readystatechange", () => {
    const requestSuccess = Boolean(
      ajax.status === 200 && ajax.readyState === 4
    );
    if (requestSuccess) {
      const { username, email } = JSON.parse(ajax.responseText);
      // timeout apenas para teste
      // setTimeout(() => {
      //   mobileUserName.innerHTML = username;
      //   userName.innerHTML = username;
      //   userEmail.innerHTML = email;
      // }, '3000');
      mobileUserName.innerHTML = username;
      userName.innerHTML = username;
      userEmail.innerHTML = email;
      return;
    }
  });
};

const backdropClickHandler = () => {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
};

const menuToggleClickHandler = () => {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
};

document.addEventListener("DOMContentLoaded", () => {
  backdrop.addEventListener("click", backdropClickHandler);
  menuToggle.addEventListener("click", menuToggleClickHandler);
  initAjax();
});
