import * as puppeteer from 'puppeteer';

export interface LoginOptions {
  username: string;
  password: string;
}

type CallbackFn<T> = (page: puppeteer.Page) => T;

export default class Browser {
  private _browser: puppeteer.Browser;
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://instagram.com';
  }

  public login({ username, password }: LoginOptions): Promise<void> {
    return this.get<void>('/accounts/login', async (page: puppeteer.Page) => {
      await page.waitForSelector('input[name="username"]');

      const usernameInput = await page.$('input[name="username"]');
      const passwordInput = await page.$('input[name="password"]');

      await usernameInput.type(username, { delay: 50 });
      await passwordInput.type(password, { delay: 50 });

      const logInButton = await page.$x('//button[contains(text(), "Log in")]');

      await logInButton[0].click();

      await page.waitFor(2000);
    });
  }

  public getUserInfo(username: string): Promise<object> {
    return this.get<object>(`/${username}`, async (page: puppeteer.Page) => {
      await page.waitFor(2000);
      const data = await page.$x('//li/span|//li/a');
      return Promise.all(data.map((element) => page.evaluate((e: HTMLElement) => {
        return e.textContent;
      }, element)));
    });
  }

  private async get<T>(url: string, fn: CallbackFn<T>): Promise<T> {
    let result: T;
    let page: puppeteer.Page;
    try {
      const browser = await this.browser();
      page = await browser.newPage();

      await page.goto(this.baseUrl + url, { waitUntil: 'load' });

      result = await fn(page);
      await page.close();
    } catch (e) {
      if (page) {
        await page.close();
      }

      throw e;
    }

    return result;
  }

  private async browser(): Promise<puppeteer.Browser> {
    if (this._browser) return this._browser
    return this._browser = await puppeteer.launch({
      args: ['--lang=en-US,en'],
      headless: true,
    });
  }

}
