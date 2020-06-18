(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const clearCartButton = document.getElementById('clear-btn');

    if (clearCartButton) {
      clearCartButton.addEventListener('click', (event) => {
        const shouldCleanUpCart = confirm('Removing all products from the cart!\nDo you want to proceed?');

        if (!shouldCleanUpCart)
          event.preventDefault();
      });
    }
  });
})();
