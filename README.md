# 🚀 React Native Awesome Bottom Sheet

[![npm version](https://img.shields.io/npm/v/react-native-awesome-bottom-sheet.svg?style=flat-up)](https://www.npmjs.com/package/react-native-awesome-bottom-sheet)
[![license](https://img.shields.io/npm/l/react-native-awesome-bottom-sheet.svg?color=blue)](https://www.npmjs.com/package/react-native-awesome-bottom-sheet)
[![platform](https://img.shields.io/badge/platform-ios%20%7C%20android-blue)](https://www.npmjs.com/package/react-native-awesome-bottom-sheet)

An ultra-smooth, lightweight, high-performance bottom sheet component for React Native built using only the core **`PanResponder`** and **`Animated`** APIs. No heavy external gesture handler libraries required!

---

## ✨ Features

- ⚡ **Pure React Native**: Built entirely on core APIs (`PanResponder` + `Animated`). Zero dependencies, keeping your bundle size tiny!
- 🎯 **Dynamic Snapping & Breakpoints**: Supports dynamic snapping (e.g. `[0.1, 0.5, 0.9]` representing height fractions) or a clean 2-point snap by default.
- 🎛️ **Dual Snapping Modes**:
  - **Auto-Snap**: Automatically stays peeked at your `min` height without closing completely.
  - **Auto-Close**: If you specify custom `snapPoints`, dragging down below the lowest snap point smoothly hides the sheet entirely off-screen and triggers `onClose`.
- 🔄 **Overscroll-Aware Handling**: Sophisticated relative drag mechanics tracking that prevents ugly jumping when capturing gestures from nested `FlatList` elements.
- 🎨 **Beautiful Visual Styling**: Premium look and feel, smooth spring-based animations (`bounciness: 4`), and responsive drag handle.

---

## 📦 Installation

```bash
npm install react-native-awesome-bottom-sheet
```

---

## 🚀 Quick Start

Here is a simple example demonstrating how to integrate the Bottom Sheet into your app:

```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';
import { BottomSheet } from 'react-native-awesome-bottom-sheet';

const App = () => {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={() => setOpen(true)} />
      <Button title="Close Bottom Sheet" onPress={() => setOpen(false)} />

      <BottomSheet
        open={open}
        max={0.9} // 90% of screen height
        min={0.1} // 10% peek height
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hello World! 👋</Text>
          <Text style={styles.subtitle}>This is a highly-performant Bottom Sheet.</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});
```

---

## 🎚️ Advanced Usage (With FlatList & Custom Breakpoints)

Pass `flatListProps` directly to let the Bottom Sheet automatically render a high-performance scrollable list:

```tsx
<BottomSheet
  open={open}
  max={0.9}
  min={0}
  snapPoints={[0, 0.4, 0.9]} // Snaps to 0% (closed), 40% (mid), and 90% (full)
  onClose={() => setOpen(false)}
  onOpen={() => setOpen(true)}
  flatListProps={{
    data: Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`),
    renderItem: ({ item }) => <Text style={{ padding: 16 }}>{item}</Text>,
    keyExtractor: item => item,
  }}
/>
```

---

## ⚙️ Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Controls whether the bottom sheet is open or collapsed. |
| `max` | `number` | `0.3` | The maximum height scale of the bottom sheet (value between `0` and `1`). |
| `min` | `number` | `0.1` | The minimum height scale of the bottom sheet (value between `0` and `1`). |
| `snapPoints` | `number[]` | `undefined` | Custom snap heights as fractions of screen height (e.g. `[0, 0.4, 0.9]`). |
| `onOpen` | `() => void` | `undefined` | Callback triggered when the sheet is fully opened. |
| `onClose` | `() => void` | `undefined` | Callback triggered when the sheet is fully closed. |
| `flatListProps` | `FlatListProps` | `undefined` | When passed, renders a fully-optimized scrollable list. |

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
