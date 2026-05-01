# quit.social

Do you find it hard to stop opening social apps out of habit? So do I.
[quit.social](https://quit.social) builds a fake-app shortcut that lives on your
home screen where the real app used to be. When muscle memory makes you tap it,
you get a gentle pause screen instead of an endless feed.

## Using it

Open [quit.social](https://quit.social) in your mobile browser and either:

1. Tap one of the preset apps (X, Facebook, TikTok, Slack, YouTube, LinkedIn,
   Instagram, Reddit, Threads, Snapchat, Discord, Pinterest), or
2. Search the App Store for any other app, or
3. Upload your own PNG icon and pick a name.

Any of those takes you straight to the fake app. Then add it to your home
screen:

- **iOS Safari**: Share icon -> Add to Home Screen.
- **Android Chrome**: Browser menu -> Add to Home screen / Install app.

Move or delete the real app, and let the fake one take its place.

## How it works

The fake app is a Progressive Web App. Once installed, it loads instantly from
its service-worker cache, so the pause screen works offline.

Your recent visits are stored only in `localStorage`. No analytics, no
accounts, no backend, no network calls beyond the App Store search you trigger.

Hosted as a fully static site on GitHub Pages.
