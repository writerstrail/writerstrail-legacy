module.exports =
{
  "development": {
    "username": "nwt",
    "password": "123123",
    "database": "nwt",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "facebook": {
      "appid": process.env.WRITERSTRAIL_FACEBOOK_ID,
      "secret": process.env.WRITERSTRAIL_FACEBOOK_SECRET,
      "callback": "http://localhost:8080/auth/facebook/callback"
    },
    "twitter": {
      "appid": process.env.WRITERSTRAIL_TWITTER_ID,
      "secret": process.env.WRITERSTRAIL_TWITTER_SECRET,
      "callback": "http://localhost:8080/auth/twitter/callback"
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://localhost:8080/auth/google/callback"
    }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "facebook": {
      appid: process.env.WRITERSTRAIL_FACEBOOK_ID,
      secret: process.env.WRITERSTRAIL_FACEBOOK_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/facebook/callback"
    },
    "twitter": {
      "appid": process.env.WRITERSTRAIL_TWITTER_ID,
      "secret": process.env.WRITERSTRAIL_TWITTER_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/twitter/callback"
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/google/callback"
    }
  },
  "production": {
    "username": process.env.OPENSHIFT_MYSQL_DB_USERNAME,
    "password": process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
    "database": process.env.OPENSHIFT_GEAR_NAME,
    "port": process.env.OPENSHIFT_MYSQL_DB_PORT,
    "host": process.env.OPENSHIFT_MYSQL_DB_HOST,
    "dialect": "mysql",
    "facebook": {
      "appid": process.env.WRITERSTRAIL_FACEBOOK_ID,
      "secret": process.env.WRITERSTRAIL_FACEBOOK_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/facebook/callback"
    },
    "twitter": {
      "appid": process.env.WRITERSTRAIL_TWITTER_ID,
      "secret": process.env.WRITERSTRAIL_TWITTER_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/twitter/callback"
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://writerstrail-flikore.rhcloud.com/auth/google/callback"
    }
  }
};
