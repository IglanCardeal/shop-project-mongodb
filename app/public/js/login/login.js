(function() {
  // Valida os campos de password e email antes de submeter o form.

  function getInputValues() {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;

    return {
      email: emailInput,
      password: passwordInput,
    };
  }

  function validateEmail(email) {
    // eslint-disable-next-line security/detect-unsafe-regex
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
      document.alert('Email or password are in a invalid format! Try again.');
    }
  }

  const submitButton = document.getElementById('submit');

  submitButton.addEventListener('click' || 'keypress', event => {
    const { email } = getInputValues();
    const { password } = getInputValues();
    shoudSubmitForm(event, validateEmail(email), validatePassword(password));
  });
})();
