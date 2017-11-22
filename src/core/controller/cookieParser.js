
class CookieParser {

  cookiesToJson(event) {
    if (!event || !event.headers || !event.headers.Cookie) return {};
    const cookiesString = event.headers.Cookie;
    const cookies = {};
    cookiesString.split(';').forEach(cookie => {
      const cookieArray = cookie.split('=');
      cookies[cookieArray[0].trim()] = cookieArray[1].trim();
    });
    return cookies;
  }

}

// export singleton
const singleton = new CookieParser();
singleton.CookieParser = CookieParser;
module.exports = singleton;
