import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import DismissKeyboardView from './src/components/DismissKeyboardView';
import RNExitApp from 'react-native-exit-app';
import Orientation from 'react-native-orientation-locker';
import { PERMISSIONS, RESULTS, request, check } from 'react-native-permissions';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
const statusBarHeight = StatusBar.currentHeight;

function App(): JSX.Element {
  const webview = useRef<WebView>(null);
  const [url, setUrl] = useState('');
  const time = useRef(0);

  useEffect(() => {
    if (deviceWidth < 601) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  useEffect(() => {
    const onPressHardwareBackButton = () => {
      if (!webview.current) {
        return false;
      }
      if (url === '/home' || url === '/logIn') {
        time.current++;
        if (time.current === 1) {
          ToastAndroid.show(
            "'뒤로' 버튼을 한 번 더 누르시면 종료됩니다.",
            ToastAndroid.SHORT,
          );
          setTimeout(() => (time.current = 0), 2000);
          return true;
        } else if (time.current >= 2) {
          RNExitApp.exitApp();
          return false;
        }
      } else {
        webview.current.goBack();
        return true;
      }
    };
    BackHandler.addEventListener(
      'hardwareBackPress',
      onPressHardwareBackButton,
    );
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        onPressHardwareBackButton,
      );
    };
  }, [url]);

  const requestPermission = () => {
    request(PERMISSIONS.ANDROID.RECORD_AUDIO).then((response) => {
      console.log(response);
    });
  };

  const checkPermission = () => {
    check(PERMISSIONS.ANDROID.RECORD_AUDIO)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            ToastAndroid.show(
              '해당 기기에서 녹음 기능을 사용할 수 없습니다.',
              ToastAndroid.SHORT,
            );
            break;
          case RESULTS.DENIED:
            ToastAndroid.show(
              '녹음 권한이 요청되지 않았거나, 거부되었지만 요청할 수 있습니다.',
              ToastAndroid.SHORT,
            );
            break;
          case RESULTS.LIMITED:
            ToastAndroid.show(
              '녹음 권한이 제한되어 있습니다. 일부 작업이 가능합니다.',
              ToastAndroid.SHORT,
            );
            break;
          case RESULTS.GRANTED:
            ToastAndroid.show(
              '녹음 권한이 허가되었습니다.',
              ToastAndroid.SHORT,
            );
            break;
          case RESULTS.BLOCKED:
            ToastAndroid.show(
              '녹음 권한이 거부되었으며, 앱 설정에서 허가할 수 있습니다.',
              ToastAndroid.SHORT,
            );
            break;
        }
      })
      .catch((error) => {
        console.log('PERMISSION ERROR : ', error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardView>
        <WebView
          ref={webview}
          style={styles.webview}
          source={{
            uri: 'https://dqr7en7diq4ph.cloudfront.net',
          }}
          injectedJavaScript={`
        (function() {
          function wrap(fn) {
            return function wrapper() {
              var res = fn.apply(this, arguments);
              window.ReactNativeWebView.postMessage('navigationStateChange');
              return res;
            }
          }
    
          history.pushState = wrap(history.pushState);
          history.replaceState = wrap(history.replaceState);
          window.addEventListener('popstate', function() {
            window.ReactNativeWebView.postMessage('navigationStateChange');
          });
        })();
    
        true;
      `}
          onMessage={({ nativeEvent: state }) => {
            if (state.data === 'navigationStateChange') {
              const currentUrl = state.url.split('net')[1];
              if (currentUrl === '/screeningTest') {
                requestPermission();
                checkPermission();
              }
              setUrl(currentUrl);
            }
          }}
        />
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: deviceWidth,
    height:
      deviceWidth < 601 ? deviceHeight : deviceHeight - (statusBarHeight ?? 0),
  },
});

export default App;
