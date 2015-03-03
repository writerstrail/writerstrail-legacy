module.exports =
{
  "development": {
    "username": "nwt",
    "password": "123123",
    "database": "nwt",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+00:00",
    "baseurl": "http://localhost:8080",
    "facebook": {
      "appid": process.env.WRITERSTRAIL_FACEBOOK_ID,
      "secret": process.env.WRITERSTRAIL_FACEBOOK_SECRET,
      "callback": process.env.WRITERSTRAIL_FACEBOOK_CALLBACK,
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": process.env.WRITERSTRAIL_GOOGLE_CALLBACK
    },
    "linkedin": {
      "appid": process.env.WRITERSTRAIL_LINKEDIN_ID,
      "secret": process.env.WRITERSTRAIL_LINKEDIN_SECRET,
      "callback": process.env.WRITERSTRAIL_LINKEDIN_CALLBACK
    },
    "wordpress": {
      "appid": process.env.WRITERSTRAIL_WORDPRESS_ID,
      "secret": process.env.WRITERSTRAIL_WORDPRESS_SECRET,
      "callback": process.env.WRITERSTRAIL_WORDPRESS_CALLBACK
    },
    "sendgrid": {
      "user": process.env.WRITERSTRAIL_SENDGRID_USER,
      "key": process.env.WRITERSTRAIL_SENDGRID_KEY
    }
  },
  "test": {
    "username": "nwt",
    "password": "123123",
    "database": "nwttest",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+00:00",
    "baseurl": "http://localhost:8080",
    "logging": null,
    "facebook": {
      "appid": "dummy",
      "secret": "dummy",
      "callback": "dummy",
    },
    "google": {
      "appid": "dummy",
      "secret": "dummy",
      "callback": "dummy"
    },
    "linkedin": {
      "appid": "dummy",
      "secret": "dummy",
      "callback": "dummy"
    },
    "wordpress": {
      "appid": "dummy",
      "secret": "dummy",
      "callback": "dummy"
    },
    "sendgrid": {
      "user": "dummy",
      "key": "dummy"
    }
  },
  "production": {
    "username": process.env.OPENSHIFT_MYSQL_DB_USERNAME,
    "password": process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
    "database": process.env.OPENSHIFT_MYSQL_DB_DATABASENAME,
    "port": process.env.OPENSHIFT_MYSQL_DB_PORT,
    "host": process.env.OPENSHIFT_MYSQL_DB_HOST,
    "dialect": "mysql",
    "timezone": "+00:00",
    "baseurl": process.env.WRITERSTRAIL_BASE_URL,
    "facebook": {
      "appid": process.env.WRITERSTRAIL_FACEBOOK_ID,
      "secret": process.env.WRITERSTRAIL_FACEBOOK_SECRET,
      "callback": process.env.WRITERSTRAIL_FACEBOOK_CALLBACK,
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": process.env.WRITERSTRAIL_GOOGLE_CALLBACK
    },
    "linkedin": {
      "appid": process.env.WRITERSTRAIL_LINKEDIN_ID,
      "secret": process.env.WRITERSTRAIL_LINKEDIN_SECRET,
      "callback": process.env.WRITERSTRAIL_LINKEDIN_CALLBACK
    },
    "wordpress": {
      "appid": process.env.WRITERSTRAIL_WORDPRESS_ID,
      "secret": process.env.WRITERSTRAIL_WORDPRESS_SECRET,
      "callback": process.env.WRITERSTRAIL_WORDPRESS_CALLBACK
    },
    "sendgrid": {
      "user": process.env.WRITERSTRAIL_SENDGRID_USER,
      "key": process.env.WRITERSTRAIL_SENDGRID_KEY
    }
  }
};
