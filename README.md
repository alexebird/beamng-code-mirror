BEAMNG-CODE-MIRROR
===

This code belongs to BeamNG.

When there is a steam update, cd to steam folder:

```
j steam
cp -a lua ui locales ~/src/beamng-code-mirror
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
#git commit ... , etc
```
