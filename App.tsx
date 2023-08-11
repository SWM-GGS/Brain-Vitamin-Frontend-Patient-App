import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import DismissKeyboardView from './src/components/DismissKeyboardView';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

function App(): JSX.Element {
  const webview = useRef<WebView>(null);
  const [isCanGoBack, setIsCanGoBack] = useState(false);

  useEffect(() => {
    const onPressHardwareBackButton = () => {
      if (webview.current && isCanGoBack) {
        webview.current.goBack();
        return true;
      } else {
        return false;
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
  }, [isCanGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardView>
        <WebView
          ref={webview}
          style={styles.webview}
          // SSL 없는 주소의 경우, 터미널에 adb reverse tcp:5173 tcp:5173 입력
          source={{ uri: 'http://localhost:5173' }}
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
              // Navigation state updated, can check state.canGoBack, etc.
              setIsCanGoBack(state.canGoBack);
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
    height: deviceHeight,
  },
});

export default App;
