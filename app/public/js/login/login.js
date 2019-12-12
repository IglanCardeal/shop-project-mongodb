(function() {
  "use strict";
  // Valida os campos de password e email antes de submeter o form.

  function getInputValues() {
    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;

    return {
      email: emailInput,
      password: passwordInput
    };
  }

  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email.toLowerCase());
  }

  function validatePassword(password) {
    const regex = /^[a-zA-Z0-9]*$/;
    return (
      regex.test(String(password)) &&
      password.length >= 3 &&
      password.length <= 25
    );
  }

  function shoudSubmitForm(event, condition1, condition2) {
    if (!condition1 || !condition2) {
      event.preventDefault();
      return alert("Email or password are in a invalid format! Try again.");
    }
  }

  const submitButton = document.getElementById("submit");

  submitButton.addEventListener("click" || "keypress", event => {
    const email = getInputValues().email;
    const password = getInputValues().password;
    shoudSubmitForm(event, validateEmail(email), validatePassword(password));
  });
})();
