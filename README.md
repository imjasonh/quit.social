# Quit Social Media

Do you find it hard to stop using social media, especially on your
mobile device? So do I. I made https://quit.social to help.

Visit https://quit.social with your mobile browser and select an
app you'd like to stop using. Add it to your phone's home screen:

* **Safari on iOS**: Tap the share icon (![iOS share icon](./ios-share.png)),
  select **Add to Home Screen** and then **Add**.
* **Chrome on Android**: Tap **Add to Homescreen**.

Move or uninstall the real app, and replace it with the quit.social shortcut.
Now, when your muscle memory makes you open the app, the fake app will open
instead!

## How it works

The app installs a [Progressive Web
App](https://developers.google.com/web/progressive-web-apps/) which looks just
like the real app.

The fake app caches its resources for offline access. Your recent visits are
stored on your device using
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Local_storage),
and doesn't track any usage metrics server-side.

The app's resources are served over HTTPS from a static-site-only App Engine
app.

## TODO

-   [ ] Reddit
-   [ ] Slack
-   [ ] Snapchat
