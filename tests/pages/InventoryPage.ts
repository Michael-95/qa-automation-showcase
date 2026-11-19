import type { Locator, Page } from '@playwright/test';
import { parseMoney } from '../support/money';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sort: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sort = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async sortBy(option: SortOption) {
    await this.sort.selectOption(option);
  }

  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((n) => n.trim());
  }

  async prices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(parseMoney);
  }

  addButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  removeButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async add(...slugs: string[]) {
    for (const slug of slugs) await this.addButton(slug).click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
