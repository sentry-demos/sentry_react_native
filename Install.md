# Prequisite Reading
General [React Native ENV Setup](https://reactnative.dev/docs/environment-setup)

Since the content on the above page may change or the link breaks, below are the respective versions of the tools for which this demo has been tested to work.

# Platform

## MacBook Pro (13-inch, 2020)
 MacOS Catalina
 10.15.5 (19F101)

# Software 
## Xcode
```Launch Xcode --> About  --> Version 12.0 (12A7209)```

## Android Studio
```Launch Android Studio --> About --> 4.0.1```


## In your Terminal:

### xcode command line tools
```
$xcode-select install
$xcode-select --version
xcode-select version 2373.
```

### Node
```
$brew install node
$node -v
v14.4.0
```

### Watchman
```
$brew install watchman
$watchman --version
4.9.0
```

### Cocoapods
```
$sudo gem install cocoapods
$pod --version
1.9.3
```

### Java
```
$java -version 
openjdk version "1.8.0_242-release"
OpenJDK Runtime Environment (build 1.8.0_242-release-1644-b3-6222593)
OpenJDK 64-Bit Server VM (build 25.242-b3-6222593, mixed mode)
```

# Gotchas

## Conflict npm versions
There is a chance that the npm version set under nvm is different from the system level and/or is differnt from the above version against which this demo was tested. 
So it is best to keep both versions same or an industrial fix could be to mv (rm) .nvm directory and only have system level node installed. Of course it is ideal 
to know as to which npm version falls "under" Xcode's PATH.

