import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        style={styles.webview}
        // SSL 없는 주소의 경우, 터미널에 adb reverse tcp:5173 tcp:5173 입력
        source={{ uri: 'http://localhost:5173/oneToFifty' }}
        // source={{ uri: 'https://naver.com' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
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
