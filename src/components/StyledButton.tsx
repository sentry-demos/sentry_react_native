import React, {useState} from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

export const StyledButton = ({
  testID,
  onPress,
  title,
  style,
  isLoading,
}: {
  testID?: string;
  style?: {
    default?: ViewStyle;
    pressed?: ViewStyle;
    defaultText?: ViewStyle;
  };
  title: string;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  isLoading?: boolean;
}): React.ReactElement => {
  const [isPressed, setIsPressed] = useState(false);
  const pressableStyle: PressableProps['style'] = ({pressed}) =>
    pressed
      ? {
          ...defaultStyles.pressed,
          ...(style && style.pressed),
        }
      : {
          ...defaultStyles.default,
          ...(style && style.default),
        };

  const InnerLoader = (
    <ActivityIndicator
      size="small"
      color="#FFFFFF"
      style={defaultStyles.loader}
    />
  );
  const InnerText = (
    <Text
      style={{
        ...(isPressed ? defaultStyles.pressedText : defaultStyles.defaultText),
        ...(style && style.defaultText),
      }}>
      {title}
    </Text>
  );

  const InnerContent = isLoading ? InnerLoader : InnerText;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={pressableStyle}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}>
      {InnerContent}
    </Pressable>
  );
};

const defaultStyles = StyleSheet.create({
  default: {
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 2,
    backgroundColor: '#002626',
  },
  pressed: {
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 2,
    backgroundColor: '#f6cfb2',
  },
  defaultText: {
    textAlign: 'center',
    fontSize: 17,
    margin: 8,
    color: 'white',
  },
  pressedText: {
    textAlign: 'center',
    fontSize: 17,
    margin: 8,
    color: '#002626',
  },
  loader: {
    margin: 8,
  },
});
