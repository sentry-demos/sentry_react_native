#!/bin/bash
# If you have an env file, and you've set EXPO_PUBLIC_SE variable to something
# other than tda, prevent the release from happening
if [ -f ".env" ]
then
    export $(cat .env | xargs)
    if [[ $EXPO_PUBLIC_SE && $EXPO_PUBLIC_SE != 'tda' ]]
    then
        printf "Your EXPO_PUBLIC_SE environment variable is set to $EXPO_PUBLIC_SE.\nThe EXPO_PUBLIC_SE variable must be set to tda to create a release.\nPlease change it in your env file and try again."
        exit
    fi
fi

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
REPO=sentry-demos/sentry_react_native

while true; do
    read -p "Do you wish to create Github Release $PACKAGE_VERSION for $REPO? Answer y/n: " yn
    case $yn in
        [Yy]* ) make install; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
done

gh release create $PACKAGE_VERSION app-release.apk sentry_react_native.app.zip
