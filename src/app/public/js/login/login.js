(function () {
  // Valida os campos de password e email antes de submeter o form.
  const submitButton = document.getElementById('submit');

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
      window.alert('Email or password are in a invalid format! Try again.');

      return;
    }
  }

  submitButton.addEventListener('click' || 'keypress', event => {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    shoudSubmitForm(event, validateEmail(emailInput), validatePassword(passwordInput));
  });
})();
