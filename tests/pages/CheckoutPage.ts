import type { Locator, Page } from '@playwright/test';
import { parseMoney } from '../support/money';

export type Customer = { firstName: string; lastName: string; postalCode: string };

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;

  readonly overviewPrices: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');

    this.overviewPrices = page.getByTestId('inventory-item-price');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillCustomer(customer: Partial<Customer>) {
    if (customer.firstName) await this.firstName.fill(customer.firstName);
    if (customer.lastName) await this.lastName.fill(customer.lastName);
    if (customer.postalCode) await this.postalCode.fill(customer.postalCode);
    await this.continueButton.click();
  }

  async summary() {
    return {
      lineItems: (await this.overviewPrices.allTextContents()).map(parseMoney),
      itemTotal: parseMoney(await this.itemTotal.innerText()),
      tax: parseMoney(await this.tax.innerText()),
      total: parseMoney(await this.total.innerText()),
    };
  }

  async finish() {
    await this.finishButton.click();
  }
}
