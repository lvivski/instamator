import IgBrowser, { IgLoginOptions } from './browser';

export default class IgBot {
  private browser: IgBrowser;

  constructor() {
    this.browser = new IgBrowser();
  }

  public async login({ username, password }: IgLoginOptions): Promise<void> {
    return this.browser.login({ username, password });
  }

  public async getUserInfo(username: string): Promise<object> {
    return this.browser.getUserInfo(username);
  }
}
