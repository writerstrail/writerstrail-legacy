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
    }
  },
  "test": {
    "username": "nwt",
    "password": "123123",
    "database": "nwt",
    "host": "127.0.0.1",
    "dialect": "mysql",
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
    }
  },
  "production": {
    "username": process.env.OPENSHIFT_MYSQL_DB_USERNAME,
    "password": process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
    "database": process.env.OPENSHIFT_MYSQL_DB_DATABASENAME,
    "port": process.env.OPENSHIFT_MYSQL_DB_PORT,
    "host": process.env.OPENSHIFT_MYSQL_DB_HOST,
    "dialect": "mysql",
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
    }
  }
};
