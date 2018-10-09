import Browser, { LoginOptions } from './browser';

export default class Instamator {
  private browser: Browser;

  constructor() {
    this.browser = new Browser();
  }

  public async login({ username, password }: LoginOptions): Promise<void> {
    return this.browser.login({ username, password });
  }

  public async getUserInfo(username: string): Promise<object> {
    return this.browser.getUserInfo(username);
  }
}
