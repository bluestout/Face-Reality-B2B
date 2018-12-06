import $ from "jquery";

const el = {
  table: "[data-wholesale-table-body]",
  submit: "[data-wholesale-submit]",
  product: "[data-wholesale-single-product]",
};

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

function loadproducts() {
  // PUT /admin/products/#{product_id}/variants/#{variant_id}.json
  $.getJSON("/admin/products.json?limit=250", (json) => {
    let products = "";
    if (!json.products || json.products <= 0) {
      return null;
    }
    for (let i = 0; i < json.products.length; i++) {
      const product = json.products[i];
      const imageSrc = getFormattedSrc(product.image.src, "90x90");
      const pTitle = product.title;

      for (let j = 0; j < product.variants.length; j++) {
        const variant = product.variants[j];
        let price = 0;
        const comparePrice = variant.compare_at_price;
        const currentPrice = variant.price;
        const option = variant.title === "Default Title" ? "" : variant.title;
        const inventory = variant.inventory_quantity;

        if (comparePrice) {
          price = `${currentPrice} <s>${comparePrice}</s>`;
        } else {
          price = currentPrice;
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
                data-qty-max-limit
                product-qty-${i}-${j}/>
              <button type='button' class='cart-table__quantity-button' data-qty-change='[product-qty-${i}-${j}]' data-direction='up'>+</button>
            </div>
          `;
        }

        products += `<tr class=' cart-table__row'>
          <td class='cart-table__cell cart-table__cell--image text-left'>
            <img src=${imageSrc} alt=${pTitle}/>
          </td>

          <td class='cart-table__cell text-left'>
            <h3 class='cart-table__product-title'>
              <a class='cart-table__product-link' nohref>${pTitle}</a>
            </h3>
            <div class='cart-table__product-id'>Product ID. ${variant.id}</div>
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
    return $(el.table).html(products);
  });
}

Shopify.queue = [];
Shopify.moveAlong = function() {
  if (Shopify.queue.length) {
    const request = Shopify.queue.shift();
    Shopify.addItem(
      request.variantId,
      request.quantity,
      request.properties,
      Shopify.moveAlong,
    );
  } else {
    window.location.replace(`${window.location.origin}/checkout`);
  }
};

// add item to the ajax queue, rather than adding it directly
function pushToQueue(variantId, quantity, properties, callback) {
  Shopify.queue.push({
    variantId,
    quantity,
    properties,
  });
  if (typeof callback === "function") {
    callback();
  }
}

// pushToQueue(gifts.waterbottle, 1, {}, Shopify.moveAlong);

function wholesaleSubmit(event) {
  event.preventDefault();
  const $products = $(el.product);
  $products.each(function() {
    const $this = $(this);
    const id = $("[name='id']", $this).val();
    const qty = $("[name='quantity']", $this).val();
    const max = $("[name='inventory']", $this).val();
    if (qty > 0) {
      if (qty > max) {
        pushToQueue(id, max, {}, Shopify.moveAlong);
      } else {
        pushToQueue(id, qty, {}, Shopify.moveAlong);
      }
    }
  });
}

$(document).on("click", el.submit, wholesaleSubmit);

$(document).ready(loadproducts);
