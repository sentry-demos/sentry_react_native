import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  PressableProps,
  Pressable,
  Keyboard,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import {UserFeedback} from '@sentry/react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import {android} from '../../utils/platform';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hideFeedbackActionButton, RootState} from '../reduxApp';
import {useDispatch, useSelector} from 'react-redux';

export const DEFAULT_COMMENTS = "It's broken again! Please fix it.";

export const SentryUserFeedbackActionButton = () => {
  const feedbackState = useSelector((state: RootState) => state.feedback);
  const [isFormVisible, setFromVisibility] = React.useState(false);
  const style = getCloseButtonStyles({safeBottom: useSafeAreaInsets().bottom});
  const pressableStyle: PressableProps['style'] = ({pressed}) =>
    pressed
      ? [
          {
            ...style.container,
            backgroundColor: '#584774',
          },
          style.shadowProp,
        ]
      : [style.container, style.shadowProp];

  const onGiveFeedbackButtonPress = () => {
    setFromVisibility(true);
  };

  return (
    <>
      {feedbackState.isActionButtonVisible && (
        <Pressable onPress={onGiveFeedbackButtonPress} style={pressableStyle}>
          <Icon name="bug" size={24} color="#fff" />
          <Text style={style.text}>Report a Bug</Text>
        </Pressable>
      )}
      {isFormVisible && (
        <UserFeedbackModal onDismiss={() => setFromVisibility(false)} />
      )}
    </>
  );
};

const getCloseButtonStyles = ({safeBottom}: {safeBottom: number}) =>
  StyleSheet.create({
    container: {
      height: 50,
      width: 160,
      borderRadius: 30,
      backgroundColor: '#29232f',
      position: 'absolute',
      bottom: safeBottom + (android(10) || 0) + 150,
      left: 10,
      paddingLeft: 15,
      paddingRight: 15,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: 'rgba(235, 230, 239, 0.15)',
      borderWidth: 1.5,
    },
    text: {
      color: '#fff',
      fontWeight: 'bold',
    },
    shadowProp: {
      shadowColor: '#171717',
      shadowOffset: {width: -2, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
  });

export function UserFeedbackModal(props: {onDismiss: () => void}) {
  const dispatch = useDispatch();
  const {onDismiss} = props;
  const [comments, onChangeComments] = React.useState(DEFAULT_COMMENTS);
  const clearComments = () => onChangeComments(DEFAULT_COMMENTS);
  const onContainerPress = () => {
    Keyboard.dismiss();
  };
  const onCloseButtonPress = () => {
    onDismiss();
    dispatch(hideFeedbackActionButton());
  };
  const onSendButtonPress = () => {
    onDismiss();

    const sentryId =
      Sentry.lastEventId() ??
      Sentry.captureMessage('User Feedback Fallback Message');

    const userFeedback: UserFeedback = {
      event_id: sentryId,
      name: Sentry.getIsolationScope().getUser()?.username ?? 'Anonymous User',
      email: Sentry.getIsolationScope().getUser()?.email,
      comments,
    };

    Sentry.captureUserFeedback(userFeedback);
    clearComments();
    dispatch(hideFeedbackActionButton());
  };

  return (
    <Pressable onPress={onContainerPress} style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Whoops, what happened?</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeComments}
          value={comments}
          multiline={true}
          numberOfLines={4}
        />
        <View style={styles.actionsWrapper}>
          <ModalButton onPress={onSendButtonPress} text="Send Bug Report" />
          <View style={styles.buttonSpacer} />
          <ModalButton
            onPress={onCloseButtonPress}
            text="Close"
            wrapperStyle={modalButtonStyles.secondaryWrapper}
            textStyle={modalButtonStyles.secondaryText}
          />
        </View>
      </View>
    </Pressable>
  );
}

const ModalButton = ({
  onPress,
  text,
  wrapperStyle,
  textStyle,
}: {
  onPress: () => void;
  text: string;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        ...modalButtonStyles.wrapper,
        ...wrapperStyle,
      }}>
      <Text
        style={{
          ...modalButtonStyles.text,
          ...textStyle,
        }}>
        {text}
      </Text>
    </Pressable>
  );
};

const modalButtonStyles = StyleSheet.create({
  wrapper: {
    borderColor: 'rgba(235, 230, 239, 0.15)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(88, 74, 192, 1)',
    padding: 10,
    borderRadius: 6,
    alignContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  secondaryText: {
    fontWeight: 'regular',
  },
});

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 5,
    backgroundColor: '#29232f',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderColor: '#584774',
    borderWidth: 2,
  },
  input: {
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 230, 239, 0.15)',
    padding: 15,
    borderRadius: 6,
    height: 100,
    width: 250,
    textAlignVertical: 'top',
    color: '#fff',
  },
  actionsWrapper: {
    width: 250,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalImage: {
    marginBottom: 20,
    width: 80,
    height: 80,
  },
  buttonSpacer: {
    marginBottom: 8,
  },
});
