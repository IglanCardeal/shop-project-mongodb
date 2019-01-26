// sobre os dados:
// - const idsArray - para adicionar os eventos para more, less e delete.
// - totalPrice e productsData sao para os dados a serem renderizados dentro da ul.
// rota para o ajax '/ajax-get-cart'.
// o inputForm tera este formato:
/*
  <form>
    <input type="submit" value="MORE" more="productId">
  </form>
*/

// OBS: este arquivo utiliza o recurso async/await do JavaScript utilizado nos eventos dos inputs, 
// logo este arquivo pode nao ser operacional em navegadores que nao suportam recursos atuais do JavaScript.

("use strict");

const init = () => {
  const $main = document.querySelector("#main");
  const ajax = new XMLHttpRequest();

  // atributos para o resultado da chamada AJAX.
  let idsArray = [];
  let productsData = [];
  let totalPrice;

  const ajaxGetCart = () => {
    // faz a chamda para a API, recebe os dados e atribui as variaveis.
    // toda vez que um input for acionado, esta funcao deve ser chamada ao final da funcao
    // relacionada ao evento do input.
    const url = "/ajax-get-cart";
    ajax.open("POST", url);
    ajax.send();
    ajax.addEventListener("readystatechange", () => {
      const requestFailed = Boolean(
        ajax.status === 500 && ajax.readyState === 4
      );
      const requestSuccess = Boolean(
        ajax.status === 200 && ajax.readyState === 4
      );
      if (requestSuccess) {
        let jsonData = JSON.parse(ajax.responseText);
        idsArray = jsonData.idsArray;
        productsData = jsonData.productsData;
        totalPrice = jsonData.totalPrice;
        return renderProductsData();
      }
      if (requestFailed) {
        const errorData = JSON.parse(ajax.responseText);
        return inCaseOfError(errorData);
      }
    });
  };

  function inCaseOfError(errorData) {
    const $center = document.createElement("center");
    const $h1 = document.createElement("h1");
    const $h2Msg = document.createElement("h2");
    const $h2Status = document.createElement("h2");
    $h1.textContent = "An error has occurred :(";
    $h2Msg.textContent = errorData.msg;
    $h2Status.textContent = errorData.status;
    document.title = errorData.title;
    $center.appendChild($h1);
    $center.appendChild($h2Msg);
    $center.appendChild($h2Status);
    $main.appendChild($center);
  }

  function setReloadEvent() {
    const $reload = document.querySelector('[data="reload"]');
    $reload.addEventListener("click", event => {
      ajaxGetCart();
    });
  }

  function whenEmptyCart($newDiv, $oldDiv) {
    const $msg = document.createElement("h1");
    const $reloadBtn = document.createElement("button");
    $reloadBtn.setAttribute("type", "button");
    $reloadBtn.setAttribute("data", "reload");
    $reloadBtn.setAttribute("class", "btn reload");
    $reloadBtn.textContent = "Reload Cart";
    $msg.textContent = "No Products in Cart Yet!";
    $msg.setAttribute("class", "empty");
    $newDiv.appendChild($msg);
    $newDiv.appendChild($reloadBtn);
    $main.replaceChild($newDiv, $oldDiv);
    setReloadEvent();
    return null;
  }

  function checkIfCartHasProducts() {
    return idsArray.length !== 0;
  }

  // faz a chamada ajax para a API que controla os products no cart.
  function setControlOverCart(action, id) {
    const ajaxControl = new XMLHttpRequest();
    ajaxControl.open("POST", "/cart-control-quantity");
    ajaxControl.setRequestHeader("Content-Type", "application/json");
    const jsonData = {
      action: action,
      productId: id
    };
    ajaxControl.send(JSON.stringify(jsonData));
    ajaxControl.addEventListener("readystatechange", () => {
      const requestFailed = Boolean(
        ajaxControl.status === 500 && ajaxControl.readyState === 4
      );
      const requestSuccess = Boolean(
        ajaxControl.status === 200 && ajaxControl.readyState === 4
      );
      if (requestSuccess) {
        return ajaxGetCart();
      }
      if (requestFailed) {
        const errorData = JSON.parse(ajax.responseText);
        return inCaseOfError(errorData);
      }
    });
  }

  function setEventsToInputs() {
    // --------------------------- more --------------------------------------
    idsArray.forEach(id => {
      const $more = document.querySelector(`[more="${id}"]`);
      $more.addEventListener("click", async event => {
        event.preventDefault();
        // alert(`Incrementou id: ${$more.attributes["more"].value}`);
        await setControlOverCart("increase", id);
      });
    });
    // --------------------------- less --------------------------------------
    idsArray.forEach(id => {
      const $less = document.querySelector(`[less="${id}"]`);
      $less.addEventListener("click", async event => {
        event.preventDefault();
        // alert(`Decrementou o id: ${$less.attributes["less"].value}`);
        await setControlOverCart("decrease", id);
      });
    });
    // --------------------------- delete --------------------------------------
    idsArray.forEach(id => {
      const $delete = document.querySelector(`[delete="${id}"]`);
      $delete.addEventListener("click", async event => {
        event.preventDefault();
        // alert(`Deletou id: ${$delete.attributes["delete"].value}`);
        await setControlOverCart("delete", id);
      });
    });
  }

  function renderProductsData() {
    const $oldDiv = document.querySelector("#content");
    const $newDiv = document.createElement("div");
    const $ul = document.createElement("ul");
    $ul.setAttribute("class", "cart__item-list");
    $newDiv.setAttribute("id", "content");

    if (!checkIfCartHasProducts()) return whenEmptyCart($newDiv, $oldDiv);

    const $liTotalPrice = document.createElement("li");
    $liTotalPrice.setAttribute("class", "cart_item price_value");
    $liTotalPrice.textContent = `Total Price: $${totalPrice}`;

    // elementos para o orderForm.
    const $orderDiv = document.createElement("div");
    const $orderForm = document.createElement("form");
    const $orderButton = document.createElement("button");
    $orderDiv.setAttribute("class", "centered order-div");
    $orderForm.setAttribute("action", "/create-order");
    $orderForm.setAttribute("method", "POST");
    $orderButton.setAttribute("type", "submit");
    $orderButton.setAttribute("class", "btn order");
    $orderButton.setAttribute("data", "order");
    $orderButton.textContent = "Order Now!";
    $orderForm.appendChild($orderButton);
    $orderDiv.appendChild($orderForm);

    // loop para renderizar todos os products no cart.
    productsData.forEach(product => {
      const $li = document.createElement("li");
      const $h1 = document.createElement("h1");
      const $h2Qty = document.createElement("h2");
      const $h2Price = document.createElement("h2");
      const $inputMore = document.createElement("input");
      const $inputLess = document.createElement("input");
      const $inputDelete = document.createElement("input");
      const $inputForm = document.createElement("form");

      $li.setAttribute("class", "cart__item");

      $h1.textContent = `${product.data.title}`;
      $h2Qty.textContent = `Quantity: ${product.quantity}`;
      $h2Price.textContent = `Price: ${product.data.price}`;

      // cria os inputs para more, less e delete.
      $inputMore.setAttribute("class", "btn primary");
      $inputMore.setAttribute("type", "button");
      $inputMore.setAttribute("value", "MORE");
      $inputMore.setAttribute("more", `${product.data._id}`);
      $inputLess.setAttribute("class", "btn warning");
      $inputLess.setAttribute("type", "button");
      $inputLess.setAttribute("value", "LESS");
      $inputLess.setAttribute("less", `${product.data._id}`);
      $inputDelete.setAttribute("class", "btn danger");
      $inputDelete.setAttribute("type", "button");
      $inputDelete.setAttribute("value", "DELETE");
      $inputDelete.setAttribute("delete", `${product.data._id}`);

      //  adiciona os inputs ao inputForm.
      $inputForm.appendChild($inputMore);
      $inputForm.appendChild($inputLess);
      $inputForm.appendChild($inputDelete);

      // adiciona na li os dados do product, inputs e depois inseri na ul.
      $li.appendChild($h1);
      $li.appendChild(document.createElement("hr"));
      $li.appendChild($h2Qty);
      $li.appendChild($h2Price);
      $li.appendChild($inputForm);
      $ul.appendChild($li);
    });

    $ul.appendChild($liTotalPrice);
    $newDiv.appendChild($ul);
    $newDiv.appendChild($orderDiv);
    $main.replaceChild($newDiv, $oldDiv);

    setEventsToInputs();
  }

  ajaxGetCart();
};

document.addEventListener("DOMContentLoaded", () => {
  init();
});
