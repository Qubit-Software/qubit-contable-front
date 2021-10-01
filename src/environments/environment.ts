// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiUrl: 'http://127.0.0.1:3000/api',
  apiUrl: 'http://localhost:3000/api',
  apiPos: 'http://127.0.0.1:3000/api',
  
  firebaseConfig: {
    apiKey: "AIzaSyCWncvXi3wqk3Jbe-rs076xpz0IGGTwBfM",
    authDomain: "qubit-contable.firebaseapp.com",
    databaseURL: "https://qubit-contable-default-rtdb.firebaseio.com",
    projectId: "qubit-contable",
    storageBucket: "qubit-contable.appspot.com",
    messagingSenderId: "948024799620",
    appId: "1:948024799620:web:bae8eb075726f930066dd1",
    measurementId: "G-R9BCQKHZPT"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
