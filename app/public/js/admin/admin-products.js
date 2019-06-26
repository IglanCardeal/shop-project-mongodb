"user strict";

const deleteProduct = async btn => {
  const productId = btn.parentNode.querySelector('[name="productId"]').value;
  const csrfToken = btn.parentNode.querySelector('[name="_csrf"]').value;

  const productElement = btn.closest("article");

  fetch(`/admin/product/${productId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken // modulo csurf no server ira procura por essa chave valor.
    }
  })
    .then(result => {
      productElement.parentNode.removeChild(productElement);
      return;
    })
    .catch(err => console.log(err));
};
