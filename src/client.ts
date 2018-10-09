import {
  Browser,
  ElementHandle,
  launch,
  Page,
} from 'puppeteer';

import * as selectors from './selectors';

import { query, queryAll } from './query';

export interface ILoginOptions {
  username: string;
  password: string;
}

export interface IClient {
  login({ username, password }: ILoginOptions): Promise<void>;
  getUserInfo(username: string): Promise<object>;
  close(): Promise<void>;
}

type CallbackFn<T> = (page: Page) => T;

export default class Client implements IClient {
  private _browser: Browser;
  private _page: Page;

  public login({ username, password }: ILoginOptions) {
    return this.get<void>('/accounts/login', async (page: Page) => {
      await page.waitFor(selectors.usernameInput);

      const usernameInput = await query(page, selectors.usernameInput);
      await usernameInput.type(username, { delay: 25 });

      const passwordInput = await query(page, selectors.passwordInput);
      await passwordInput.type(password, { delay: 50 });

      const loginButton = await query(page, selectors.loginButton);
      await loginButton.click();

      await page.waitForNavigation({ timeout: 2000 });
    });
  }

  public logout() {
    return this.get<void>('/accounts/logout', async (page: Page) => {
      await page.waitForNavigation({ timeout: 2000 });
    });
  }

  public getUserInfo(username: string) {
    return this.get<object>(`/${username}`, async (page: Page) => {
      const data = await queryAll(page, '//li/span|//li/a');

      return Promise.all(data.map(async (element: ElementHandle) => {
        const text = await element.getProperty('textContent');
        return text.jsonValue();
      }));
    });
  }

  public async close() {
    const browser = await this.browser();
    return browser.close();
  }

  private async get<T>(path: string, fn?: CallbackFn<T>) {
    let result: T;
    const page = await this.page();

    try {
      await page.goto(`https://instagram.com${path}`, { waitUntil: 'load' });

      if (fn) {
        result = await fn(page);
      }

    } catch (e) {
      throw e;
    }

    return result;
  }

  private async browser(): Promise<Browser> {
    if (this._browser) {
      return this._browser;
    }

    return this._browser = await launch({
      args: ['--lang=en-US,en'],
      headless: false,
    });
  }

  private async page(): Promise<Page> {
    if (this._page) {
      return this._page;
    }
    const browser = await this.browser();
    const page = await browser.newPage();
    const ua = await browser.userAgent();
    page.setUserAgent(ua.replace('Headless', ''));

    return this._page = page;
  }

}
