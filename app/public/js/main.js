"use strict";

const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");
const userName = document.querySelector('[data="user-name"]');
const mobileUserName = document.querySelector('[data="mobile-user-name"]');
const token = document.querySelector('[data="token"]').value;

const initAjax = isMobile => {
  if (userName != undefined) {
    userName.innerHTML = "carregando";
    mobileUserName.innerHTML = "carregando";
    const url = "/admin/postUserData";
    const ajax = new XMLHttpRequest();
    ajax.open("POST", url);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(
      JSON.stringify({
        _csrf: token
      })
    );
    ajax.addEventListener("readystatechange", () => {
      const requestSuccess = Boolean(
        ajax.status === 200 && ajax.readyState === 4
      );
      if (requestSuccess) {
        const { username } = JSON.parse(ajax.responseText);
        mobileUserName.innerHTML = username;
        userName.innerHTML = username;
        return;
      }
    });
  } else {
    return null;
  }
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
