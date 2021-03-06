// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appVersion: require('../../package.json').version + '-dev',
  production: false,
  // apiBaseUrl : 'http://localhost:7071/api',
  apiBaseUrl : 'https://goofflinee.azurewebsites.net/api',
  blobURL: 'https://goofflinee.blob.core.windows.net',
  offlineWebsiteURL: 'https://goofflinee.azureedge.net',
  appInsightsKey: '3e02a970-cb6e-4b40-85f7-657a6171d65a',
  bingMapsKey: 'ApayHvJCBIGX2ZEs_Nf4CHxcIebub7SLR8loVBR286OXyIqdSAExGKR1YOrS2P2U',
  sqlLiteDBName: 'goOfflineE',
  StaticSourcePath: 'default',
  PageTitle: 'Social Experiments',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
