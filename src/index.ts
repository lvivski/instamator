import * as dotenv from 'dotenv';
import Client from './client';

dotenv.config();
async function start() {
  try {
    const client = new Client();

    await client.login({
      password: process.env.PASSWORD,
      username: process.env.USERNAME,
    });

    const tagMedia = await client.getTagMedia('macro');
    console.log(tagMedia);

    const locationMedia = await client.getLocationMedia('213131048');
    console.log(locationMedia);

    const userMedia = await client.getUserMedia('o_nedlinska');
    console.log(userMedia);

    const userData = await client.getUserInfo('o_nedlinska');
    console.log(userData);

    await client.close();
  } catch (e) {
    throw e;
  }
}

start();
