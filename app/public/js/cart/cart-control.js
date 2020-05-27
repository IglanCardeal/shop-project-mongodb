/* eslint-disable no-underscore-dangle */
/**
 * REFATORAR ESTE CODIGO
 */
const init = () => {
  const AJAX_DELAY_CART = 500; // tempo de espera apos o primeiro click para efetuar a chamada AJAX do cart.
  const CAR_LOAD_DELAY = 500;

  const $main = document.querySelector('#main');
  const token = document.querySelector('[data="token"]').value;
  const ajax = new XMLHttpRequest();

  // atributos para o resultado da chamada AJAX.
  let idsArray = [];
  let productsData = [];
  let totalPrice;

  function ajaxGetCart() {
    // faz a chamda para a API, recebe os dados e atribui as variaveis.
    // toda vez que um input for acionado, esta funcao deve ser chamada ao final da funcao relacionada ao evento do input.
    setTimeout(sendAjaxRequest, CAR_LOAD_DELAY);
  };

  function inCaseOfError(errorData) {
    const $center = document.createElement('center');
    const $h1 = document.createElement('h1');
    const $h2Msg = document.createElement('h2');
    const $h2Status = document.createElement('h2');
    $h1.textContent = 'An error has occurred :(';
    $h2Msg.textContent = errorData.msg;
    $h2Status.textContent = errorData.status;
    document.title = errorData.title;
    $center.appendChild($h1);
    $center.appendChild($h2Msg);
    $center.appendChild($h2Status);
    $main.appendChild($center);
  }

  function delay(callback, time) {
    let timer = 0;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(callback, time);
    };
  }

  function setReloadEvent() {
    const $reload = document.querySelector('[data="reload"]');
    $reload.addEventListener('click', () => {
      delay(ajaxGetCart, AJAX_DELAY_CART);
    });
  }

  function whenEmptyCart($newDiv, $oldDiv) {
    const $msg = document.createElement('h1');
    const $reloadBtn = document.createElement('button');
    $reloadBtn.setAttribute('type', 'button');
    $reloadBtn.setAttribute('data', 'reload');
    $reloadBtn.setAttribute('class', 'btn reload');
    $reloadBtn.textContent = 'Reload Cart';
    $msg.textContent = 'No Products in Cart Yet!';
    $msg.setAttribute('class', 'empty');
    $newDiv.setAttribute('id', 'content');
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
    const ajaxControlCart = new XMLHttpRequest();
    ajaxControlCart.open('POST', '/cart-control-quantity');
    ajaxControlCart.setRequestHeader('Content-Type', 'application/json');
    const jsonData = {
      _csrf: token,
      action: action,
      productId: id,
    };
    ajaxControlCart.send(JSON.stringify(jsonData));
    ajaxControlCart.addEventListener('readystatechange', () => {
      const requestFailed = Boolean(
        ajaxControlCart.status === 500 && ajaxControlCart.readyState === 4
      );
      const requestSuccess = Boolean(
        ajaxControlCart.status === 200 && ajaxControlCart.readyState === 4
      );
      if (requestSuccess) {
        ajaxGetCart();
      }
      if (requestFailed) {
        const errorData = JSON.parse(ajax.responseText);
        inCaseOfError(errorData);
      }
    });
  }

  function setEventsToInputs() {
    // --------------------------- more --------------------------------------
    idsArray.forEach(id => {
      const $more = document.querySelector(`[more="${id}"]`);
      $more.addEventListener('click', async event => {
        event.preventDefault();
        setControlOverCart('increase', id);
      });
    });
    // --------------------------- less --------------------------------------
    idsArray.forEach(id => {
      const $less = document.querySelector(`[less="${id}"]`);
      $less.addEventListener('click', async event => {
        event.preventDefault();
        setControlOverCart('decrease', id);
      });
    });
    // --------------------------- delete --------------------------------------
    idsArray.forEach(id => {
      const $delete = document.querySelector(`[delete="${id}"]`);
      $delete.addEventListener('click', async event => {
        event.preventDefault();
        setControlOverCart('delete', id);
      });
    });
  }

  function renderProductsData() {
    const $oldDiv = document.querySelector('#content');
    const $newDiv = document.createElement('div');
    if (!checkIfCartHasProducts()) {
      whenEmptyCart($newDiv, $oldDiv);
    }
    const $ul = document.createElement('ul');
    $ul.setAttribute('class', 'cart__item-list');
    $newDiv.setAttribute('id', 'content');

    const $liTotalPrice = document.createElement('li');
    $liTotalPrice.setAttribute('class', 'cart_item price_value');
    $liTotalPrice.textContent = `Total Price: $${totalPrice}`;

    // elementos para o orderForm.
    const $orderDiv = document.createElement('div');
    const $orderForm = document.createElement('form');
    const $orderButton = document.createElement('link');
    const $token = document.createElement('input');
    $orderDiv.setAttribute('class', 'centered order-div');
    $orderForm.setAttribute('action', '/create-order');
    $orderForm.setAttribute('method', 'POST');
    $token.setAttribute('type', 'hidden');
    $token.setAttribute('name', '_csrf');
    $token.setAttribute('value', token);
    $orderButton.setAttribute('type', 'submit');
    $orderButton.setAttribute('class', 'btn order');
    $orderButton.setAttribute('data', 'order');
    $orderButton.setAttribute('href', '/checkout');
    $orderButton.textContent = 'Order Now!';
    $orderForm.appendChild($orderButton);
    $orderForm.appendChild($token);
    $orderDiv.appendChild($orderForm);

    // loop para renderizar todos os products no cart.
    productsData.forEach(product => {
      const $li = document.createElement('li');
      const $title = document.createElement('h1');
      const $img = document.createElement('img');
      const $quantity = document.createElement('h2');
      const $price = document.createElement('h2');
      const $inputMore = document.createElement('input');
      const $inputLess = document.createElement('input');
      const $inputDelete = document.createElement('input');
      const $inputForm = document.createElement('form');

      $li.setAttribute('class', 'cart__item');

      // img do product.
      $img.setAttribute('src', product.data.imageUrl);
      $img.setAttribute('class', 'product-img');

      $title.textContent = `${product.data.title}`;
      $quantity.textContent = `Quantity: ${product.quantity}`;
      $price.textContent = `Unit price: $${product.data.price}`;

      // cria os inputs para more, less e delete.
      $inputMore.setAttribute('class', 'btn primary');
      $inputMore.setAttribute('type', 'button');
      $inputMore.setAttribute('value', 'MORE');
      $inputMore.setAttribute('more', `${product.data._id}`);
      $inputLess.setAttribute('class', 'btn warning');
      $inputLess.setAttribute('type', 'button');
      $inputLess.setAttribute('value', 'LESS');
      $inputLess.setAttribute('less', `${product.data._id}`);
      $inputDelete.setAttribute('class', 'btn danger');
      $inputDelete.setAttribute('type', 'button');
      $inputDelete.setAttribute('value', 'DELETE');
      $inputDelete.setAttribute('delete', `${product.data._id}`);

      //  adiciona os inputs ao inputForm.
      $inputForm.appendChild($inputMore);
      $inputForm.appendChild($inputLess);
      $inputForm.appendChild($inputDelete);

      // adiciona na li os dados do product, inputs e depois inseri na ul.
      $li.appendChild($title);
      $li.appendChild(document.createElement('hr'));
      $li.appendChild($img);
      $li.appendChild(document.createElement('hr'));
      $li.appendChild($quantity);
      $li.appendChild($price);
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

  function animationWhileLoading() {
    const loadingDiv = document.createElement('div');
    const loadingTitle = document.createElement('h2');
    const loadingImg = document.createElement('img');
    loadingImg.setAttribute('src', '/img/loading.gif');
    loadingImg.setAttribute('class', 'loading-gif');
    loadingTitle.innerHTML = 'Loading products. Wait few seconds.';
    loadingTitle.setAttribute('class', 'loading-title');
    loadingDiv.setAttribute('class', 'loading');
    loadingDiv.appendChild(loadingImg);
    loadingDiv.appendChild(loadingTitle);
    $main.appendChild(loadingDiv);
  }

  function clearLoadingAnimation() {
    const $loadDiv = document.querySelector('.loading');
    if ($loadDiv) {
      $main.removeChild($loadDiv);
    }
  }

  function sendAjaxRequest() {
    const url = '/ajax-get-cart';
    ajax.open('POST', url);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send(
      JSON.stringify({
        _csrf: token,
      })
    );
    ajax.addEventListener('readystatechange', () => {
      const requestFailed = Boolean(
        ajax.status === 500 && ajax.readyState === 4
      );
      const requestSuccess = Boolean(
        ajax.status === 200 && ajax.readyState === 4
      );
      if (requestSuccess) {
        const jsonData = JSON.parse(ajax.responseText);
        idsArray = jsonData.idsArray;
        productsData = jsonData.productsData;
        totalPrice = jsonData.totalPrice;
        clearLoadingAnimation();
        renderProductsData();
      }
      if (requestFailed) {
        const errorData = JSON.parse(ajax.responseText);
        clearLoadingAnimation();
        inCaseOfError(errorData);
      }
    });
  }

  animationWhileLoading();
};

document.addEventListener('DOMContentLoaded', init());
