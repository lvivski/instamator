import * as puppeteer from 'puppeteer';

export interface ILoginOptions {
  username: string;
  password: string;
}

export interface IBrowser {
  login({ username, password }: ILoginOptions): Promise<void>;
  getUserInfo(username: string): Promise<object>;
  close(): Promise<void>;
}

type CallbackFn<T> = (page: puppeteer.Page) => T;

export default class Browser implements IBrowser {
  private _browser: puppeteer.Browser;
  private _page: puppeteer.Page;

  public login({ username, password }: ILoginOptions) {
    return this.get<void>('/accounts/login', async (page: puppeteer.Page) => {
      await page.waitForSelector('input[name="username"]');

      const usernameInput = await page.$('input[name="username"]');
      await usernameInput.type(username, { delay: 25 });

      const passwordInput = await page.$('input[name="password"]');
      await passwordInput.type(password, { delay: 50 });

      const logInButton = await page.$x('//button[contains(text(), "Log in")]');
      await logInButton[0].click();

      await page.waitFor(500);
    });
  }

  public getUserInfo(username: string) {
    return this.get<object>(`/${username}`, async (page: puppeteer.Page) => {
      await page.waitFor(500);

      const data = await page.$x('//li/span|//li/a');

      return Promise.all(data.map(async (element: puppeteer.ElementHandle) => {
        const text = await element.getProperty('textContent');
        return text.jsonValue();
      }));
    });
  }

  public async close() {
    const browser = await this.browser();
    return browser.close();
  }

  private async get<T>(path: string, fn: CallbackFn<T>) {
    let result: T;
    const page = await this.page();

    try {
      await page.goto(`https://instagram.com${path}` , { waitUntil: 'load' });

      result = await fn(page);
    } catch (e) {
      throw e;
    }

    return result;
  }

  private async browser(): Promise<puppeteer.Browser> {
    if (this._browser) {
      return this._browser;
    }

    return this._browser = await puppeteer.launch({
      args: ['--lang=en-US,en'],
      headless: false,
    });
  }

  private async page(): Promise<puppeteer.Page> {
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
