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

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardView>
        <WebView
          ref={webview}
          style={styles.webview}
          // SSL 없는 주소의 경우, 터미널에 adb reverse tcp:5173 tcp:5173 입력
          // source={{ uri: 'http://localhost:5173' }}
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
              setUrl(state.url.split('com')[1]);
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
