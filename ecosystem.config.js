module.exports = {
  apps: [
    {
      name: "API",
      script: "./server/app.js",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production",
        GOOGLE_CLIENT_ID:
          "256910682363-hae9jkf5v9vqt92il3bhk2a63mj0unej.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "eD2GLF0HzRz_YfFb-cmwlolN",
        TWITTER_CLIENT_ID: "8nvPXefhv6cFRRlJ1dmxQxRKL",
        TWITTER_CLIENT_SECRET:
          "iI1h3vrHrbRUV2Fx99sW2ooUKyrrTXoYEzYiQD29374EBXlDeZ",
        FACEBOOK_CLIENT_ID: "380244012638838",
        FACEBOOK_CLIENT_SECRET: "bb76f0a3dddbbcb69207c8c9377a454c",
        LINKEDIN_CLIENT: "811lutf2193ulh",
        LINKEDIN_SECRET: "kLPP3Lc8GkHi2S6g",
        PAYPAL_CLIENT_ID_LIVE:
          "AUd4hSzZaL-Zkzp_q_OUmWSo75oxyKgGuFH-AwmJubjCW9sozu6WhCR6Y9RDfAtJVec_jWYzzh3pRJf0",

        PAYPAL_CLIENT_SECRET_LIVE:
          "EJa_XSXgrxHVXbnmek7ksHjuBsSUFpEX9JQ8Dj3cMxYJRNXuizZ27s_76y4Yec_NjaKo1AIMHEtD4qYn",

        PAYPAL_CLIENT_ID_SANDBOX:
          "AQxs815Fj6TnGnRG6B8p4jCDypx48XfIsu_2OJGm6nR5ppRA62xkmIHbfN3-l8DPuSmh5E6zbpjfg5Iz",
        PAYPAL_CLIENT_SECRET_SANDBOX:
          "EH-etS67AebuXmDq4kmjIbV-OEvze2ovHNOsakQp4eVg4mtgdr-w5cMxn5UsVV46t-EbUSZvFBsY8KX7",

        NODEMAILER_USER_ID: "blocktutorial@mail001.dakghar.in",
        NODEMAILER_USER_PASS: "B#@$846XinFin",

        SUPP_EMAILER_ID: "studentadda101@gmail.com",
        SUPP_EMAILER_PSD: "QwertY))&",

        BITLY_ACCESS_TOKEN: "222a3be5b0f207f2d3e2beab63423dc13108ee4c",

        DATABASE_URI: "mongodb://localhost/blockdegree_UAT",

        COOKIE_KEY: "voerjnvodafnvjawrviuoahsvpjkoarniwvup",

        IPFS_NETWORK: "xinfin",

        HOST: "https://uat.blockdegree.org",

        SUPP_EMAIL_ID: "rudresh@xinfin.org",

        ADMIN_ID: "rudresh@xinfin.org"
      }
    }
  ],

  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};
