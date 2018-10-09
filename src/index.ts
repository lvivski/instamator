import * as dotenv from 'dotenv';
import Instamator from './instamator';

dotenv.config();

const instamator = new Instamator();

instamator.login({
  password: process.env.PASSWORD,
  username: process.env.USERNAME,
})
.then(() => instamator.getUserInfo('lvivski'))
.then((data) => console.log(data))
.catch((error) => console.log("error", error));
