import * as dotenv from 'dotenv';
import Client from './client';
import Instamator from './instamator';

dotenv.config();
async function start() {
  try {
    const client = new Client();
    const instamator = new Instamator(client);

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
