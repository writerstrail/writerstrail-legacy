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
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://localhost:8080/auth/google/callback"
    },
    "linkedin": {
      "appid": process.env.WRITERSTRAIL_LINKEDIN_ID,
      "secret": process.env.WRITERSTRAIL_LINKEDIN_SECRET,
      "callback": "http://localhost:8080/auth/linkedin/callback"
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
      "callback": "http://localhost:8080/auth/facebook/callback"
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://localhost:8080/auth/google/callback"
    },
    "linkedin": {
      "appid": process.env.WRITERSTRAIL_LINKEDIN_ID,
      "secret": process.env.WRITERSTRAIL_LINKEDIN_SECRET,
      "callback": "http://localhost:8080/auth/linkedin/callback"
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
      "callback": "http://writerstrail.georgemarques.com.br/auth/facebook/callback"
    },
    "google": {
      "appid": process.env.WRITERSTRAIL_GOOGLE_ID,
      "secret": process.env.WRITERSTRAIL_GOOGLE_SECRET,
      "callback": "http://writerstrail.georgemarques.com.br/auth/google/callback"
    },
    "linkedin": {
      "appid": process.env.WRITERSTRAIL_LINKEDIN_ID,
      "secret": process.env.WRITERSTRAIL_LINKEDIN_SECRET,
      "callback": "http://writerstrail.georgemarques.com.br/auth/linkedin/callback"
    }
  }
};
