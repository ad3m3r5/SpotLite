# SpotLite
A minimal/lightweight Spotify web client using React


## Why?
I thought it would be a good project to learn more about react and electron. It also allowed me to learn more about integrating front-end applications with back-end services provided by other parties.


## Issues With Widevine/Electron
Widevine is a DRM component that is developed by Google and used by many streaming platforms, such as Spotify and Netflix. Due to Electron using Chromium, it does not have Widevine installed by default, nor support for Widevine's VMP. Using a fork of electron enabled this capability, but without signed production certificates, the app is unable to properly stream content. To get around this issue, I ended up building a version using a pop-out window, but the originating browser must have Widevine enabled.


## Using The App
To use the web version of the application, you must first have a Spotify Premium account. You must also enable popups and media auto-playing in your browser. Once doing so, you can use Spotify's OAuth system to sign into the app. From here on, you can stream your saved music and playlists.


## Hosting Or Building It Yourself
To host the application, you must first register an application on Spotify's Developer portal (free). Then place your Client ID and Client Secret in the .env file at the root of the application. Set your callback URLs respectively.

* Web: Run the "build" script and host the static files in the build directory.

* Electron version (issues mentioned above): Clone from the electron branch. Download the electron-wvvmp source and point the "electronDist" directory to it. Run the "react-build" script, followed by the respective "electron-build-osVersion" script.


## Credits
 - Mountains & wolf background as well as logo design - [RCrowe](https://rcrowe.art)
 - Spotify Playback SDK Callback Functionality, this helped with receiving status data from Spotify - [react-spotify-web-playback](https://github.com/gilbarbara/react-spotify-web-playback)


## Tech/Software Used
-  [NodeJS](https://nodejs.org/en/)
-  [npm](https://www.npmjs.com/)
-  [VS Code](https://code.visualstudio.com/)

Main Libraries Used

-  [React](https://reactjs.org/)
-  [Electron](https://www.electronjs.org/)
-  [Electron-wvvmp](https://github.com/castlabs/electron-releases)
-  [electron-builder](https://www.electron.build/)
-  [Material-UI](https://material-ui.com/)
-  [Redux](https://redux.js.org/)
-  [Redux Persist](https://github.com/rt2zz/redux-persist)
-  [styled-componenets](https://styled-components.com/)
-  [axios](https://github.com/axios/axios)
-  [concurrently](https://github.com/kimmobrunfeldt/concurrently)
-  [cross-env](https://github.com/kentcdodds/cross-env)

## Screenshots
Logged Out!
[Logged Out](https://user-images.githubusercontent.com/11009228/74411322-f0825680-4e08-11ea-9035-850c78f7c19e.png)

User Library - Track Lists (Tracks/Playlists)
![User Library - Track Lists](https://user-images.githubusercontent.com/11009228/74412274-0729ad00-4e0b-11ea-99bd-042885d24f91.png)

User Library - Block View (Albums/Artists)
![User Library - Block View](https://user-images.githubusercontent.com/11009228/74412364-40621d00-4e0b-11ea-9458-885c796ec2c1.png)

Spotify OAuth Login
![Spotify OAuth Login](https://user-images.githubusercontent.com/11009228/74412384-4e17a280-4e0b-11ea-84ec-86f9450f6eb5.png)