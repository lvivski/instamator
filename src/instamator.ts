import { IBrowser, ILoginOptions } from './browser';

export default class Instamator {
  private browser: IBrowser;

  constructor(browser: IBrowser) {
    this.browser = browser;
  }

  public login({ username, password }: ILoginOptions): Promise<void> {
    return this.browser.login({ username, password });
  }

  public getUserInfo(username: string): Promise<object> {
    return this.browser.getUserInfo(username);
  }

  public stop(): Promise<void> {
    return this.browser.close();
  }
}
