import { formatMoney } from "@shopify/theme-currency";
import $ from "jquery";

// list all the dom elements used in the script here
const el = {
  table: "[data-wholesale-table-body]",
  qty: "[data-wholesale-quantity]",
  submit: "[data-wholesale-submit]",
  product: "[data-wholesale-single-product]",
  row: "[data-wholesale-row]",
  filter: {
    count: "[data-wholesale-product-count]",
    sort: "[data-wholesale-sort]",
    reset: "[data-wholesale-sort-reset]",
    type: "[data-wholesale-sort-type]",
    availability: "[data-wholesale-sort-availability]",
  },
  price: "[data-wholesale-price]",
  priceCompare: "[data-wholesale-price-compare]",
  savingsBox: "[data-wholesale-savings-container]",
  savings: "[data-wholesale-savings]",
  total: "[data-wholesale-total]",
  addedContainer: "[data-item-added-container]",
  addedMessage: "[data-item-added-message]",
  shippingCheck: "[data-wholesale-shipping-check]",
  inCartTotalBox: "[data-wholesale-in-cart-container]",
  inCartTotal: "[data-wholesale-in-cart-total]",
  inCartHeader: "[data-wholesale-in-cart-qty-header]",
  inCartQty: "[data-wholesale-in-cart-qty]",
  orderTotal: "[data-wholesale-order-total]",
  cartQty: "[data-cart-count]",
  cartQtyPos: "[data-cart-count-position]",
};

// all the product variant ids used
// currently supports pumps only. If more products should become addable, this needs to be adjusted,
// starting from making this variable an array rather than an object
const addableIds = {
  pump: 19946386686041,
  training: 20157070442585,
};

// any constant values used
const values = {
  minOrder: 0,
  freeShipping: 60000,
  eligibleText: "You are eligible for free shipping",
  notEligibleLeft: "You are ",
  notEligibleRight: " away from free shipping",
  addToCartQueue: [],
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
  }
  return iSrc;
}

// use the shopify api to load products - only way to actually get all the prodcuts and variants like we need them to
function loadProducts(cart) {
  $.ajax({
    type: "GET",
    url: "/pages/wholesale-order-form?view=wholesale-order-products.json",
    async: false,
    dataType: "html",
    success: (json) => {
      const data = JSON.parse(json);
      const itemsInCart = [];
      for (let i = 0; i < cart.items.length; i++) {
        itemsInCart.push({
          id: cart.items[i].id,
          quantity: cart.items[i].quantity,
        });
      }

      const cartHasItems = itemsInCart.length > 0 ? true : false;
      if (cartHasItems) {
        // add in cart table header
        $(el.inCartHeader).show();
        // add in cart qty to table
        // show in cart subtotal
      }

      let products = "";
      if (!data.products || data.products <= 0) {
        return null;
      }

      // sort object keys by product type
      const keysSorted = Object.keys(data.products).sort((ela, elb) => {
        if (data.products[ela].type < data.products[elb].type) {
          return -1;
        }
        if (data.products[ela].type > data.products[elb].type) {
          return 1;
        }
        return 0;
      });

      let currentType = "";
      const currentTypesCount = {};

      for (let i = 0; i < data.products.length; i++) {
        // use the sorted keys to determine in what order to show products
        const product = data.products[keysSorted[i]];

        // hide hidden products (has hidden-product tag)
        if (!product.tags.includes("hidden-product")) {
          const pTitle = product.title;
          const pType = product.type;
          const pTypeClean = pType.replace(" ", "-");
          let pAvailability = "";
          let pBackbar = false;
          let pRetail = false;

          // declare new type, if it does not exist yet
          if (!currentTypesCount[pTypeClean]) {
            currentTypesCount[pTypeClean] = 0;
          }

          // add to the product counter
          currentTypesCount[pTypeClean] += 1;
          if (product.variants.length > 1) {
            currentTypesCount[pTypeClean] += product.variants.length - 1;

            for (let j = 0; j < product.variants.length; j++) {
              const variant = product.variants[j];
              if (variant.title.toLowerCase().indexOf("backbar") > -1) {
                pBackbar = true;
              } else {
                pRetail = true;
              }
            }
          }

          pAvailability = pRetail ? `${pAvailability} retail` : pAvailability;
          pAvailability = pBackbar ? `${pAvailability} backbar` : pAvailability;

          // add a header at the top of new product types
          if (currentType !== pType) {
            currentType = pType;
            let colspan = cartHasItems ? 5 : 4;
            if ($(window).width() < 992) {
              colspan = 1;
            }
            products += `<tr class="cart-table__row availability-all type-all ${pTypeClean} ${pAvailability}" data-wholesale-row>
              <td class="cart-table__cell d-none d-md-table-cell" colspan="1"></td>
              <td class="cart-table__cell cart-table__cell--type" colspan="${colspan}">
                <h3 class="cart-table__type-header">${currentType}</h3>
                <span class="cart-table__type-count" data-type="${pTypeClean}">0</span>
                <span class="cart-table__type-count">products</span>
              </td>
            </tr>`;
          }

          let image = "";
          if (product.images && product.images[0]) {
            image = getFormattedSrc(product.images[0], "180x180");
            image = `<img src=${image} alt=${pTitle}/>`;
          }

          for (let j = 0; j < product.variants.length; j++) {
            const variant = product.variants[j];
            let price = 0;
            const comparePrice = variant.compare_at_price;
            const currentPrice = variant.price;
            const option =
              variant.title === "Default Title" ? "" : variant.title;
            let vAvailability = "";
            let vBackbar = false;
            let vRetail = false;

            if (variant.title.toLowerCase().indexOf("backbar") > -1) {
              vBackbar = true;
            } else if (variant.title.length > 0) {
              vRetail = true;
            }

            vAvailability = vRetail ? "retail" : "";
            vAvailability = vBackbar
              ? `${vAvailability} backbar`
              : `${vAvailability}`;

            let quantityInCart = 0;
            let inCart = "";
            let inCartDiv = "";
            for (let k = 0; k < itemsInCart.length; k++) {
              if (itemsInCart[k].id === variant.id) {
                quantityInCart = itemsInCart[k].quantity;
              }
            }
            if (cartHasItems) {
              inCart = `<td class='cart-table__cell text-center d-none d-md-table-cell'>
                <div class='cart-table__price' data-wholesale-in-cart-qty>
                  ${quantityInCart}
                </div>
              </td>`;
              inCartDiv = `<div class='cart-table__qty-in-cart d-md-none text-right'>
                <span>Cart Quantity:</span>
                <span>${quantityInCart}</span>
              </div>`;
            }

            if (comparePrice) {
              price = `<span data-wholesale-price="${currentPrice}">${formatMoney(
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
            if (variant.available) {
              qtyString = `
                <div class='cart-table__quantity'>
                  <button type='button' class='cart-table__quantity-button' data-qty-change='[product-qty-${i}-${j}]' data-direction='down'>-</button>
                  <input
                    class='cart-table__quantity-input'
                    type='number'
                    name='quantity'
                    value=0
                    min='0'
                    data-wholesale-quantity
                    product-qty-${i}-${j}/>
                  <button type='button' class='cart-table__quantity-button' data-qty-change='[product-qty-${i}-${j}]' data-direction='up'>+</button>
                </div>
              `;
            }

            products += `<tr class='cart-table__row availability-all type-all ${pTypeClean} ${vAvailability}' data-wholesale-row>
              <td class='cart-table__cell cart-table__cell--image text-left d-none d-md-table-cell'>
                <div class="cart-table__image-wrap">
                  ${image}
                </div>
              </td>

              <td class='cart-table__cell cart-table__cell--title text-left d-none d-md-table-cell'>
                <h3 class='cart-table__product-title'>
                  <a class='cart-table__product-link' nohref>${pTitle}</a>
                </h3>
                <div class='cart-table__product-id'>Product ID. ${
                  variant.sku
                }</div>
              </td>

              <td class='cart-table__cell text-center d-none d-md-table-cell'>
                <div class='cart-table__option'>
                  ${option}
                </div>
              </td>

              <td class='cart-table__cell text-center d-none d-md-table-cell'>
                <div class='cart-table__price'>
                  ${price}
                </div>
              </td>

              <td class='cart-table__cell cart-table__cell--last'>

                <div class="d-md-none">
                  <div class="cart-table__rsp-image-wrap">${image}</div>
                  <div class="cart-table__rsp-content">
                    <h3 class="cart-table__rsp-title">
                      <a class='cart-table__rsp-link' nohref>${pTitle}</a>
                      <span class="cart-table__rsp-price">${price}</span>
                    </h3>
                    <div class="cart-table__rsp-info">
                      <span class="cart-table__rsp-option">${
                        variant.title
                      }</span>
                      <span class="cart-table__rsp-id">Product ID. ${
                        variant.sku
                      }</span>
                      </div>
                    </div>
                  <div class="clearfix"></div>
                </div>

                <form action="/" method="post" class="cart-table__item-form" novalidate data-wholesale-single-product>
                  <input type="hidden" name="id" value="${variant.id}"/>
                  ${qtyString}
                </form>
                ${inCartDiv}
              </td>
              ${inCart}
            </tr>`;
          }
        }
      }
      // now that we have all the product counts, replace the values in the products string
      let productCountAll = 0;
      let sortOptionsType = "";
      if (currentTypesCount && typeof currentTypesCount === "object") {
        for (let i = 0; i < Object.keys(currentTypesCount).length; i++) {
          const value = currentTypesCount[Object.keys(currentTypesCount)[i]];
          const key = Object.keys(currentTypesCount)[i];
          let niceKey = "";
          niceKey =
            key && typeof key === "string" ? key.replace("-", " ") : null;
          products = products.replace(
            `type="${key}">0`,
            `type="${key}">${value}`,
          );
          productCountAll += value;
          sortOptionsType += `<option value="${key}">${niceKey}</option>`;
        }
      }

      $(el.filter.type).append(sortOptionsType);
      $(el.filter.count).text(`${productCountAll} products total`);
      $(el.table).html(products);
      return calculateTotals();
    },
    cache: false,
  });
}

function updateCartQty() {
  $.getJSON("/cart.js", (json) => {
    if (json.item_count > 0) {
      if ($(el.cartQty).length > 0) {
        $(el.cartQty).text(json.item_count);
      } else {
        $(el.cartQtyPos).append(
          `<span class="utility-nav__count" data-cart-count>${
            json.item_count
          }</span>`,
        );
      }
    }
  });
}

// this movealong is used first
// when loop is done, re-iterate the cart
function moveAlong(data) {
  if (values.addToCartQueue.length > 0) {
    const request = values.addToCartQueue.shift();
    addItemCustom(
      request.variantId,
      request.quantity,
      request.properties,
      () => {
        moveAlong(data);
      },
    );
  } else if (data === "redirect") {
    window.location.replace(`${window.location.origin}/cart`);
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
    success: (data) => {
      if (data.variant_id !== addableIds.pump) {
        showMessage(itemAddedMessage(data.title, data.quantity));
        typeof callback === "function" ? callback() : null;
      }
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

function itemAddedMessage(title, qty) {
  if (!title && !qty) {
    return false;
  } else {
    const verb = qty > 1 ? "are" : "is";
    const message = `${qty} of ${title} ${verb} now in your cart.`;
    return showMessage(message);
  }
}

// add item to the ajax queue, rather than adding it directly
function pushToQueue(variantId, quantity, properties, callback) {
  values.addToCartQueue.push({
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
  }, 3000);
  return eventHolder;
}

function wholesaleSubmit(event) {
  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  const totals = parseInt($(el.total).data("wholesale-total"), 10);
  if (totals > values.minOrder) {
    const $products = $(el.product);
    $products.each(function() {
      const $this = $(this);
      const id = $("[name='id']", $this).val();
      const qty = $("[name='quantity']", $this).val();
      if (qty > 0) {
        pushToQueue(id, qty, {}, () => {
          moveAlong("redirect");
        });
      } else {
        moveAlong("redirect");
      }
    });
  } else {
    showMessage(
      `Minimum order value is ${formatMoney(
        values.minOrder,
        theme.moneyFormat,
      )}`,
    );
  }
}

// remove falsy && empty values from array
function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

// main filter functionality - toggle items based on what filter was clicked
function wholesaleSort(event) {
  const $source = $(event.currentTarget);
  const tag = $source.val();

  // when clicking an input, change the active tag classes
  if ($source[0].tagName === "SELECT") {
    $source.removeClass();
    $source.addClass(`wholesale-filter__sort ${tag}`);
  }
  runFilter();
}

// do the actual filtering here
function runFilter() {
  const allClasses = [];
  let activeTags = "";

  // remove the -all tag and the element class from the query
  $(el.filter.sort).each(function() {
    let classes = $(this).attr("class");
    if (classes) {
      classes = classes
        .replace(/type-all/, "")
        .replace(/availability-all/, "")
        .replace(/wholesale-filter__sort/, "")
        .split(/\s+/);
      classes = cleanArray(classes);
      if (classes.length > 0) {
        for (let i = 0; i < classes.length; i++) {
          activeTags += `.${classes[i]}`;
          allClasses.push(classes[i]);
        }
      }
      // push the remaining (actual tags) to the allclasses array
    }
  });

  // depending on the allClasses content show or hide items
  if (allClasses.length > 0) {
    $(`${el.row}${activeTags}`).fadeIn();
    $(`${el.row}:not(${activeTags})`).fadeOut();
  } else {
    $(el.row).fadeIn();
  }
}

function wholesaleSortReset() {
  $(el.row).show();
  $(el.filter.sort).val("all");
}

function calculateTotals() {
  let totals = 0;
  let cartTotals = 0;
  let orderTotals = 0;
  let compare = 0;
  $(el.row).each(function() {
    const $this = $(this);
    const qty = $(el.qty, $this).val();
    const inCartQty = parseInt($(el.inCartQty, $this).text(), 10);
    const price = parseFloat($(el.price, $this).data("wholesale-price"));
    const priceCompare = parseFloat(
      $(el.priceCompare, $this).data("wholesale-price-compare"),
    );
    if (qty > 0) {
      orderTotals += price * qty;
      if (priceCompare > 0) {
        compare += priceCompare * qty;
      } else {
        compare += price * qty;
      }
    }
    if (inCartQty > 0) {
      cartTotals += price * inCartQty;
      if (priceCompare > 0) {
        compare += priceCompare * inCartQty;
      } else {
        compare += price * inCartQty;
      }
    }
  });

  totals = cartTotals + orderTotals;
  const savings = compare - totals;

  if (cartTotals > 0) {
    $(el.inCartTotal).text(formatMoney(cartTotals, theme.moneyFormat));
    $(el.inCartTotalBox).show();
  }

  $(el.orderTotal).text(formatMoney(orderTotals, theme.moneyFormat));

  $(el.savings).text(formatMoney(savings, theme.moneyFormat));
  $(el.total)
    .text(formatMoney(totals, theme.moneyFormat))
    .data("wholesale-total", totals);

  if (totals >= values.freeShipping) {
    $(el.shippingCheck).text(values.eligibleText);
  } else {
    $(el.shippingCheck).text(
      values.notEligibleLeft +
        formatMoney(values.freeShipping - totals, theme.moneyFormat) +
        values.notEligibleRight,
    );
  }

  if (compare && compare > totals) {
    $(el.savingsBox).show();
  } else {
    $(el.savingsBox).hide();
  }
}

// insert id/line, quantity, isline?
// reduce the remove from cart & change quantity for id & line to 1 function
function ajaxChangeCartQty(id, qty, isLine, redirect) {
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
      redirect && moveAlong(redirect);
    },
    cache: false,
  });
}

// https://facerealityskincare-b2b.myshopify.com/pages/wholesale-order-form?view=wholesale-order.json

// this function checks if products need to added or removed from the cart automatically,
// based on the products already in the cart
function automaticProducts(cart, redirect) {
  const redirectData = redirect ? "redirect" : "nothing";
  let pumpsInCart = 0;
  let trainingQty = 0;
  let pumpsQtyShouldBe = 0;
  const cartProducts = [];

  const idsInCart = [];
  for (let i = 0; i < cart.items.length; i++) {
    idsInCart.push([cart.items[i].id, cart.items[i].quantity]);
    if (cart.items[i].id === addableIds.pump) {
      pumpsInCart += cart.items[i].quantity;
    }
    if (cart.items[i].id === addableIds.training) {
      trainingQty += cart.items[i].quantity;
    }
  }

  (async () => {
    for (let j = 0; j < cart.items.length; j++) {
      await new Promise((resolve) => {
        resolve(
          $.ajax({
            type: "GET",
            url: "/pages/wholesale-order-form?view=wholesale-order-meta.json",
            async: false,
            dataType: "html",
            success: (data) => {
              const varIdToAdd = addToCartByMetafield(
                JSON.parse(data),
                cart.items[j],
              );
              if (varIdToAdd) {
                cartProducts.push({
                  id: varIdToAdd,
                  qty: cart.items[j].quantity,
                });
              }
            },
            cache: false,
          }),
        );
      });
    }

    (async () => {
      await new Promise((resolve) => {
        if (trainingQty > 1) {
          resolve(ajaxChangeCartQty(addableIds.training, 1));
        } else {
          resolve();
        }
      });

      for (let i = 0; i < cartProducts.length; i++) {
        const productAddTag = cartProducts[i];
        if (productAddTag.id === addableIds.pump) {
          pumpsQtyShouldBe += productAddTag.qty;
        }
      }

      if (pumpsInCart > 0 && pumpsQtyShouldBe === 0) {
        ajaxChangeCartQty(addableIds.pump, 0, false, redirectData);
      } else if (pumpsQtyShouldBe > pumpsInCart) {
        pushToQueue(addableIds.pump, pumpsQtyShouldBe - pumpsInCart, {}, () => {
          moveAlong(redirectData);
        });
      } else if (pumpsQtyShouldBe < pumpsInCart) {
        ajaxChangeCartQty(
          addableIds.pump,
          pumpsQtyShouldBe,
          false,
          redirectData,
        );
      } else {
        moveAlong(redirectData);
      }
      updateCartQty();
    })();
  })();
}

function addToCartByMetafield(json, cartItem) {
  if (json && json.products.length > 0 && cartItem) {
    for (let i = 0; i < json.products.length; i++) {
      const product = json.products[i].variants;
      for (let j = 0; j < product.length; j++) {
        const variant = product[j];
        if (
          variant.add &&
          variant.add.length > 0 &&
          variant.id === cartItem.variant_id
        ) {
          if (/^[0-9]{14,}$/.test(variant.add)) {
            return parseInt(variant.add, 10);
          }
        }
      }
    }
  }
  return false;
}

$(document).on("click", el.submit, wholesaleSubmit);

$(document).on("click", el.filter.reset, wholesaleSortReset);

$(document).on("change", el.filter.sort, wholesaleSort);

$(document).on("change", el.qty, calculateTotals);

// run ajax on page load to get cart contents
$(document).ready(() => {
  $.getJSON("/cart.js", (json) => {
    automaticProducts(json, false);
    if (document.getElementById("wholesale-order-form")) {
      loadProducts(json);
    }
  });
});
