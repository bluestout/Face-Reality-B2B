import { formatMoney } from "@shopify/theme-currency";
import $ from "jquery";

// list all the dom elements used in the script here
const el = {
  table: "[data-wholesale-table-body]",
  qty: "[data-wholesale-quantity]",
  submit: "[data-wholesale-submit]",
  product: "[data-wholesale-single-product]",
  count: "[data-wholesale-product-count]",
  sort: "[data-wholesale-sort-type]",
  row: "[data-wholesale-row]",
  reset: "[data-wholesale-sort-reset]",
  price: "[data-wholesale-price]",
  priceCompare: "[data-wholesale-price-compare]",
  savingsBox: "[data-wholesale-savings-container]",
  savings: "[data-wholesale-savings]",
  total: "[data-wholesale-total]",
  addedContainer: "[data-item-added-container]",
  addedMessage: "[data-item-added-message]",
};

// all the product variant ids used
// currently supports pumps only. If more products should become addable, this needs to be adjusted,
// starting from making this variable an array rather than an object
const addableIds = {
  pump: 19946386686041,
};

// any constant values used
const values = {
  minOrder: 125,
};

// format source text with correct file type
function getFormattedSrc(src, size) {
  if (!src || typeof size !== "string") {
    return null;
  }
  let iSrc = src.substring(0, src.indexOf("?v", 0));
  if (iSrc.indexOf(".png") > -1) {
    iSrc = `${iSrc.substring(0, iSrc.length - 4)}_${size}.png`;
  } else if (iSrc.indexOf(".jpg") > -1) {
    iSrc = `${iSrc.substring(0, iSrc.length - 4)}_${size}.jpg`;
  } else if (iSrc.indexOf(".jpeg") > -1) {
    iSrc = `${iSrc.substring(0, iSrc.length - 5)}_${size}.jpeg`;
  } else if (iSrc.indexOf(".gif") > -1) {
    iSrc = `${iSrc.substring(0, iSrc.length - 4)}_${size}.gif`;
  }
  return iSrc;
}

// use the shopify api to load products - only way to actually get all the prodcuts and variants like we need them to
function loadProducts() {
  // PUT /admin/products/#{product_id}/variants/#{variant_id}.json
  $.getJSON("/admin/products.json?limit=250", (json) => {
    let products = "";
    if (!json.products || json.products <= 0) {
      return null;
    }

    // sort object keys by product type
    const keysSorted = Object.keys(json.products).sort((ela, elb) => {
      if (json.products[ela].product_type < json.products[elb].product_type) {
        return -1;
      }
      if (json.products[ela].product_type > json.products[elb].product_type) {
        return 1;
      }
      return 0;
    });

    let currentType = "";
    const currentTypesCount = {};

    for (let i = 0; i < json.products.length; i++) {
      // use the sorted keys to determine in what order to show products
      const product = json.products[keysSorted[i]];

      // hide hidden products (has hidden-product tag)
      if (!product.tags.includes("hidden-product")) {
        const pTitle = product.title;
        const pType = product.product_type;
        const pTypeClean = pType.replace(" ", "-");

        // declare new type, if it does not exist yet
        if (!currentTypesCount[pTypeClean]) {
          currentTypesCount[pTypeClean] = 0;
        }

        // add to the product counter
        currentTypesCount[pTypeClean] += 1;
        if (product.variants.length > 1) {
          currentTypesCount[pTypeClean] += product.variants.length - 1;
        }

        // add a header at the top of new product types
        if (currentType !== pType) {
          currentType = pType;
          products += `<tr class="cart-table__row" data-wholesale-row="${pTypeClean}">
            <td class="cart-table__cell" colspan="1"></td>
            <td class="cart-table__cell cart-table__cell--type" colspan="4">
              <h3 class="cart-table__type-header">${currentType}</h3>
              <span class="cart-table__type-count" data-type="${pTypeClean}">0</span>
              <span class="cart-table__type-count">products</span>
            </td>
          </tr>`;
        }

        let image = "";
        if (product.image) {
          image = getFormattedSrc(product.image.src, "90x90");
          image = `<img src=${image} alt=${pTitle}/>`;
        }

        for (let j = 0; j < product.variants.length; j++) {
          const variant = product.variants[j];
          let price = 0;
          const comparePrice = variant.compare_at_price;
          const currentPrice = variant.price;
          const option = variant.title === "Default Title" ? "" : variant.title;
          const inventory = variant.inventory_quantity;

          if (comparePrice) {
            price = `<span data-wholesale-price>${formatMoney(
              currentPrice,
              theme.moneyFormat,
            )}</span>
            <span><s data-wholesale-price-compare="${comparePrice}">${formatMoney(
              comparePrice,
              theme.moneyFormat,
            )}</s></span>`;
          } else {
            price = `<span data-wholesale-price="${currentPrice}">${formatMoney(
              currentPrice,
              theme.moneyFormat,
            )}<span>`;
          }

          let qtyString = `<div class="cart-table__note">Out of stock</div>
          <input type="hidden" name="inventory" value="0"/>
          <input type="hidden" name="quantity" value="0"/>`;
          if (inventory > 0) {
            qtyString = `
              <div class='cart-table__quantity'>
                <input type="hidden" name="inventory" value="${inventory}"/>
                <button type='button' class='cart-table__quantity-button' data-qty-change='[product-qty-${i}-${j}]' data-direction='down'>-</button>
                <input
                  class='cart-table__quantity-input'
                  type='number'
                  name='quantity'
                  value='0'
                  min='0'
                  max='${inventory}'
                  data-wholesale-quantity
                  product-qty-${i}-${j}/>
                <button type='button' class='cart-table__quantity-button' data-qty-change='[product-qty-${i}-${j}]' data-direction='up'>+</button>
              </div>
            `;
          }

          products += `<tr class=' cart-table__row' data-wholesale-row="${pTypeClean}">
            <td class='cart-table__cell cart-table__cell--image text-left'>${image}</td>

            <td class='cart-table__cell cart-table__cell--title text-left'>
              <h3 class='cart-table__product-title'>
                <a class='cart-table__product-link' nohref>${pTitle}</a>
              </h3>
              <div class='cart-table__product-id'>Product ID. ${
                variant.id
              }</div>
            </td>

            <td class='cart-table__cell text-center'>
              <div class='cart-table__option'>
                ${option}
              </div>
            </td>

            <td class='cart-table__cell text-center'>
              <div class='cart-table__price'>
                ${price}
              </div>
            </td>

            <td class='cart-table__cell cart-table__cell--last'>
              <form action="/" method="post" novalidate data-wholesale-single-product>
                <input type="hidden" name="id" value="${variant.id}"/>
                ${qtyString}
              </form>
            </td>
          </tr>`;
        }
      }
    }
    // now that we have all the product counts, replace the values in the products string
    let productCountAll = 0;
    let sortOptions = "";
    if (currentTypesCount && typeof currentTypesCount === "object") {
      for (let i = 0; i < Object.keys(currentTypesCount).length; i++) {
        const value = currentTypesCount[Object.keys(currentTypesCount)[i]];
        const key = Object.keys(currentTypesCount)[i];
        let niceKey = "";
        niceKey = key && typeof key === "string" ? key.replace("-", " ") : null;
        products = products.replace(
          `type="${key}">0`,
          `type="${key}">${value}`,
        );
        productCountAll += value;
        sortOptions += `<option value="${key}">${niceKey}</option>`;
      }
    }

    $(el.sort).append(sortOptions);
    $(el.count).text(`${productCountAll} products total`);
    return $(el.table).html(products);
  });
}

const addToCartQueue = [];
function moveAlong(redirect) {
  if (addToCartQueue.length > 0) {
    const request = addToCartQueue.shift();
    addItemCustom(
      request.variantId,
      request.quantity,
      request.properties,
      moveAlong,
    );
  } else if (false) {
    window.location.replace(`${window.location.origin}/checkout`);
  }
}

function addItemCustom(id, qty, properties, callback) {
  const params = {
    quantity: qty,
    id,
  };
  if (properties) {
    params.properties = properties;
  }
  $.ajax({
    type: "POST",
    url: "/cart/add.js",
    dataType: "json",
    data: params,
    async: false,
    success: () => {
      typeof callback === "function" ? callback() : null;
    },
    error: (jqXHR) => {
      if (
        jqXHR.responseJSON.status === 422 &&
        jqXHR.responseJSON.description.length > 0
      ) {
        showMessage(jqXHR.responseJSON.description);
      }
    },
  });
}

// add item to the ajax queue, rather than adding it directly
function pushToQueue(variantId, quantity, properties, callback) {
  addToCartQueue.push({
    variantId,
    quantity,
    properties,
  });
  if (typeof callback === "function") {
    callback();
  }
}

let eventHolder = null;
function showMessage(message) {
  if (!message || typeof message !== "string") {
    return null;
  }
  clearTimeout(eventHolder);
  $(el.addedMessage).html(message);
  $(el.addedContainer).addClass("active");
  eventHolder = setTimeout(() => {
    $(el.addedContainer).removeClass("active");
  }, 4500);
  return eventHolder;
}

function wholesaleSubmit(event) {
  event.preventDefault();
  const totals = parseInt($(el.total).data("wholesale-total"), 10);
  if (totals > values.minOrder) {
    const $products = $(el.product);
    $products.each(function() {
      const $this = $(this);
      const id = $("[name='id']", $this).val();
      const qty = $("[name='quantity']", $this).val();
      const max = $("[name='inventory']", $this).val();
      if (qty > 0) {
        if (qty > max) {
          pushToQueue(id, max, {}, moveAlong);
        } else {
          pushToQueue(id, qty, {}, moveAlong);
        }
      }
    });
  } else {
    showMessage(
      `Minimum order value is ${formatMoney(
        values.minOrder * 100,
        theme.moneyFormat,
      )}`,
    );
  }
}

function wholesaleSort(event) {
  const $this = $(event.currentTarget);
  const option = $this.val();
  if (option === "all") {
    $(el.row).show();
  } else {
    $(el.row)
      .not(`[data-wholesale-row="${option}"]`)
      .hide();
    $(`[data-wholesale-row="${option}"]`).show();
  }
}

function wholesaleSortReset() {
  $(el.row).show();
  $(el.sort).val("all");
}

function calculateTotals() {
  let totals = 0;
  let compare = 0;
  $(el.row).each(function() {
    const $this = $(this);
    const qty = $(el.qty, $this).val();
    if (qty > 0) {
      const price = $(el.price, $this).data("wholesale-price");
      const priceCompare = $(el.price, $this).data("wholesale-price-compare");
      totals += price * qty;

      if (priceCompare) {
        compare += priceCompare * qty;
      } else {
        compare += price * qty;
      }
    }
  });

  $(el.savings).text(formatMoney(compare * 100, theme.moneyFormat));
  $(el.total)
    .text(formatMoney(totals * 100, theme.moneyFormat))
    .data("wholesale-total", totals);

  if (compare && compare > totals) {
    $(el.savingsBox).show();
  } else {
    $(el.savingsBox).hide();
  }
}

// insert id/line, quantity, isline?
// reduce the remove from cart & change quantity for id & line to 1 function
function ajaxChangeCartQty(id, qty, isLine) {
  let data = { quantity: qty, id };
  if (isLine) {
    data = { quantity: qty, isLine: id };
  }
  $.ajax({
    type: "POST",
    url: "/cart/change.js",
    async: false,
    data,
    dataType: "json",
    success: () => {
      console.log("item removed");
    },
    cache: false,
  });
}

// this function checks if products need to added or removed from the cart automatically,
// based on the products already in the cart
function automaticProducts(cart) {
  let pumpsInCart = 0;
  let pumpsQtyShouldBe = 0;
  const cartProducts = [];

  const idsInCart = [];
  for (let i = 0; i < cart.items.length; i++) {
    idsInCart.push([cart.items[i].id, cart.items[i].quantity]);
    if (cart.items[i].id === addableIds.pump) {
      pumpsInCart += cart.items[i].quantity;
    }
  }

  (async function loop() {
    for (let j = 0; j < cart.items.length; j++) {
      await new Promise((resolve) => {
        resolve(
          $.getJSON(
            `/admin/products/${cart.items[j].product_id}.json?fields=tags`,
            (json) => {
              const varIdToAdd = addToCartByTag(json);
              cartProducts.push({
                id: varIdToAdd,
                qty: cart.items[j].quantity,
              });
            },
          ),
        );
      });
    }

    for (let i = 0; i < cartProducts.length; i++) {
      const productAddTag = cartProducts[i];
      if (productAddTag.id === addableIds.pump) {
        pumpsQtyShouldBe += productAddTag.qty;
      }
    }

    // console.log("cartProducts: ", cartProducts);
    // console.log("pumpsInCart: ", pumpsInCart);
    // console.log("pumpsQtyShouldBe: ", pumpsQtyShouldBe);

    if (pumpsInCart > 0 && pumpsQtyShouldBe === 0) {
      ajaxChangeCartQty(addableIds.pump, 0);
    } else if (pumpsQtyShouldBe > pumpsInCart) {
      pushToQueue(
        addableIds.pump,
        pumpsQtyShouldBe - pumpsInCart,
        {},
        moveAlong,
      );
    } else if (pumpsQtyShouldBe < pumpsInCart) {
      ajaxChangeCartQty(addableIds.pump, pumpsQtyShouldBe);
    }
  })();
}

function addToCartByTag(json) {
  if (json && json.product && json.product.tags) {
    const tag = json.product.tags;
    const addStart = tag.indexOf("add-equivalent-");
    if (addStart === -1) {
      return false;
    }
    const addEnd = tag.indexOf(" ", addStart);
    const addId = tag.substring(15, addEnd - 1);
    if (/^[0-9]{14,}$/.test(addId)) {
      return parseInt(addId, 10);
    } else {
      return false;
    }
  } else {
    return false;
  }
}

$(document).on("click", el.submit, wholesaleSubmit);

$(document).on("click", el.reset, wholesaleSortReset);

$(document).on("change", el.sort, wholesaleSort);

$(document).on("change", el.qty, calculateTotals);

// run ajax on page load to get cart contents
$(document).ready(() => {
  loadProducts();

  $.getJSON("/cart.js", (json) => {
    automaticProducts(json);
  });
});
