PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
REPO=sentry-demos/sentry_react_native

while true; do
    read -p "Is the right value set for SE tag in .env? Answer y/n: " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
done

while true; do
    read -p "Do you wish to create Github Release $PACKAGE_VERSION for $REPO? Answer y/n: " yn
    case $yn in
        [Yy]* ) make install; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
done

gh release create $PACKAGE_VERSION app-debug.apk app-release.apk sentry_react_native.app.zip sentry_react_native_debug.app.zip

