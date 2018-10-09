import { Page } from 'puppeteer';

export async function queryAll(page: Page, selector: string) {
  const isXPath = selector.startsWith('//');
  return isXPath ? await page.$x(selector) : await page.$$(selector);
}

export async function query(page: Page, selector: string) {
  const result = await queryAll(page, selector);
  return result[0];
}
