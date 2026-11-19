export type Product = { slug: string; name: string; price: number };

/** A small, stable subset of the catalogue used by the shopping flows. */
export const PRODUCTS = {
  backpack: { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
} satisfies Record<string, Product>;

export const CATALOGUE_SIZE = 6;
