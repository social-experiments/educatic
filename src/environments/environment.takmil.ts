export const environment = {
  appVersion: require('../../package.json').version,
  production: true,
  apiBaseUrl: 'https://takmil-api.azurewebsites.net/api',
  blobURL: 'https://goofflinee.blob.core.windows.net',
  offlineWebsiteURL: 'https://goofflinee.azureedge.net',
  appInsightsKey: 'd17999d5-f224-430e-8673-7a549dd41010',
  bingMapsKey: 'AjOemizn3nDrqCfM1H-U4iIdfBYfB5ZRYKxkQnm1p1Z85-OddVc4Jdsmf5W7Mst9',
  sqlLiteDBName: 'takmil',
  StaticSourcePath: 'takmil',
  PageTitle: 'Takmil',
};