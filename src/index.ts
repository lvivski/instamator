import * as dotenv from 'dotenv';
import Browser from './browser';
import Instamator from './instamator';

dotenv.config();
async function start() {
  try {
    const browser = new Browser();
    const instamator = new Instamator(browser);

    await instamator.login({
      password: process.env.PASSWORD,
      username: process.env.USERNAME,
    });

    const data = await instamator.getUserInfo('lvivski');
    console.log(data);

    await instamator.stop();
  } catch (e) {
    throw e;
  }
}

start();
