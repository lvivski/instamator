import {
  Browser,
  launch,
  Page,
} from 'puppeteer';

import * as selectors from './selectors';

import { query } from './query';


export interface ILoginOptions {
  username: string;
  password: string;
}

export interface IClient {
  login({ username, password }: ILoginOptions): Promise<void>;
  close(): Promise<void>;
}

type CallbackFn<T> = (page: Page) => T;
type MediaType = 'Video' | 'Post' | '';

export default class Client implements IClient {
  private _browser: Browser;
  private _page: Page;

  public login({ username, password }: ILoginOptions) {
    return this.get<void>('/accounts/login/', async (page: Page) => {
      await page.waitFor(selectors.usernameInput);

      const usernameInputHandle = await query(page, selectors.usernameInput);
      await usernameInputHandle.type(username, { delay: 25 });

      const passwordInputHandle = await query(page, selectors.passwordInput);
      await passwordInputHandle.type(password, { delay: 50 });

      const loginButtonHandle = await query(page, selectors.loginButton);
      await loginButtonHandle.click();

      await page.waitForNavigation();
    });
  }

  public logout() {
    return this.get<void>('/accounts/logout/', async (page: Page) => {
      await page.waitForNavigation();
    });
  }

  public async close() {
    const browser = await this.browser();
    return browser.close();
  }

  public getUserInfo(username: string) {
    return this.get<object>(`/${username}/`, async (page: Page) => {
      const following = await page.evaluate('_sharedData.entry_data.ProfilePage[0].graphql.user.edge_follow.count');
      const followers = await page.evaluate('_sharedData.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count'); // tslint:disable-line

      return {
        followers,
        following,
      };
    });
  }

  public getUserMedia(username: string, amount = 100, mediaTypes: MediaType[] = ['']) {
    return this.getMedia(
      `/${username}/`,
      '_sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count',
      'main > div > div:nth-of-type(2)',
      amount,
      mediaTypes,
    );
  }

  public getTagMedia(tag: string, amount = 100, mediaTypes: MediaType[] = ['']) {
    return this.getMedia(
      `/tags/${tag}/`,
      '_sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.count',
      'main > article > div:nth-of-type(2)',
      amount,
      mediaTypes,
    );
  }

  public getLocationMedia(location: string, amount = 100, mediaTypes: MediaType[] = ['']) {
    return this.getMedia(
      `/explore/locations/${location}/`,
      '_sharedData.entry_data.LocationsPage[0].graphql.location.edge_location_to_media.count',
      'main > article > div:nth-of-type(2)',
      amount,
      mediaTypes,
    );
  }

  private getMedia(endpoint: string, totalHandle: string, mainHandle: string, amount: number, mediaTypes: MediaType[]) {
    return this.get<object>(endpoint, async (page: Page) => {
      const total = await page.evaluate(totalHandle);
      const links = await page.evaluate(async (mainElement: HTMLElement, limit: number, media: MediaType[]) => {
        let count = 0;
        const set = new Set<string>();
        while (count < limit) {
          Array.from(mainElement.querySelectorAll('a'))
            .forEach((a: HTMLAnchorElement) => {
              if (media.includes(a.text as MediaType)) {
                set.add(a.href);
              }
            });

          if (set.size > count) {
            count = set.size;
          } else {
            break;
          }

          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((resolve) => {
            setTimeout(resolve, 1500);
          });
        }

        return Array.from(set);
      }, mainHandle, Math.min(amount, total), mediaTypes);

      return {
        links,
        total,
       };
    });
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
      headless: true,
    });
  }

  private async page(): Promise<Page> {
    if (this._page) {
      return this._page;
    }
    const browser = await this.browser();
    const page = await browser.newPage();
    const ua = await browser.userAgent();

    await page.setUserAgent(ua.replace('Headless', ''));
    await page.setViewport({ width: 1024, height: 768 });

    return this._page = page;
  }

}
