module.exports = {
  apps : [{
    name   : "podryad",
    script : "./app.js",
    env_production: {
       NODE_ENV: "production"
    }
  }]
}