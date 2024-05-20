import React from 'react';
import {Image, StyleSheet} from 'react-native';
import * as Sentry from '@sentry/react-native';

const ProfiledImage = Sentry.withProfiler(Image);

export const selectImage = (
  source: string,
  style: StyleMedia = styles.tinyImage,
): React.ReactElement => {
  /**
   * Images need to be able to be analyzed so that the packager can resolve them and package in the app automatically.
   * Dynamic strings with require syntax is not possible.
   * https://github.com/facebook/react-native/issues/2481
   */
  // Image name comes from the url path to the image. In this app, we have the images in the bundle. In application-monitoring the url path is used for fetching the image.
  let length = source.split('/').length;
  let image = source.split('/')[length - 1];
  switch (image) {
    case 'plant-spider-cropped.jpg':
      return (
        <ProfiledImage
          style={style}
          source={require('../assets/images/plant-spider-cropped.png')}
        />
      );
    case 'plant-to-text-cropped.jpg':
      return (
        <ProfiledImage
          style={style}
          source={require('../assets/images/plant-to-text-cropped.png')}
        />
      );
    case 'nodes-cropped.jpg':
      return (
        <ProfiledImage
          style={style}
          source={require('../assets/images/nodes-cropped.png')}
        />
      );
    case 'mood-planter-cropped.png':
      return (
        <ProfiledImage
          style={style}
          source={require('../assets/images/mood-planter-cropped.png')}
        />
      );
    default:
      return (
        <ProfiledImage
          style={style}
          source={require('../assets/images/mood-planter-cropped.png')}
        />
      );
  }
};

const styles = StyleSheet.create({
  tinyImage: {
    width: 100,
    height: 150,
  },
});
