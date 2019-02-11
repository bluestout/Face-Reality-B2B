import { formatMoney } from "@shopify/theme-currency";
import $ from "jquery";

const el = {
  button: "[data-cart-update-button]",
  input: "[data-cart-table-quantity]",
  totals: "[data-cart-summary-total]",
  addedContainer: "[data-item-added-container]",
  addedMessage: "[data-item-added-message]",
};

const values = {
  minOrder: 12500,
};

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

function alignCartUpdateButtons() {
  const width = $(el.input).width();
  $(el.button).css({ "max-width": width });
}

function handleFormSubmit(event) {
  if ($(el.totals).data("cart-summary-total") < values.minOrder) {
    event.preventDefault();
    showMessage(
      `Minimum order value is ${formatMoney(
        values.minOrder,
        theme.moneyFormat,
      )}`,
    );
  }
}

$(window).on("resize", alignCartUpdateButtons);

$(document).ready(alignCartUpdateButtons);

$("input[name='checkout']").click(handleFormSubmit);
