import * as dotenv from 'dotenv';
import IgBot from './igbot';

dotenv.config();

const igbot = new IgBot();

igbot.login({
  password: process.env.PASSWORD,
  username: process.env.USERNAME,
})
.then(() => igbot.getUserInfo('lvivski').catch((error) => console.log("error", error)))
.then((data) => console.log(data))
.catch((error) => console.log("error", error));
