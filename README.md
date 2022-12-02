# paper-nu-college-scheduler

# 🚀 Automated data retrieval and management system for Paper 🚀

https://github.com/coding-to-music/paper-nu-college-scheduler

https://paper-nu-college-scheduler.vercel.app

From / By https://github.com/dilanx/paper.nu

https://github.com/dilanx/paper.nu-data

https://www.paper.nu/?

## Environment variables:

```java
const TOKEN_URL = 'https://auth.dilanxd.com/authenticate/token';
const ENDPOINT = 'https://auth.dilanxd.com/plan-nu';

var plans: AccountDataMap | undefined = undefined;
var schedules: AccountDataMap | undefined = undefined;

async function authLogin(
  authorizationCode?: string,
  state?: string
): Promise<ConnectionResponse> {
  da('auth login');
  localStorage.removeItem('t');
  if (!authorizationCode) {
    let url = new URL(window.location.href);
    url.searchParams.set('action', 'login');
    let state = Utility.generateRandomString(32);
    localStorage.setItem('t_s', state);
    da('no auth code in query, new access token required, redirecting');
    window.open(
      'https://auth.dilanxd.com/authenticate?client_id=' +
        process.env.REACT_APP_PUBLIC_CLIENT_ID +

const VERSION = process.env.REACT_APP_VERSION ?? '0.0.0';

```

## GitHub

```java
git init
git add .
git remote remove origin
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:coding-to-music/paper-nu-college-scheduler.git
git push -u origin main
```

# paper.nu

**Paper** is a website to help Northwestern students plan out their courses at the university. Find more information and get started at [paper.nu](https://www.paper.nu).
