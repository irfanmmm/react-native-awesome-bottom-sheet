import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
  PanResponderGestureState,
  FlatListProps,
  GestureResponderEvent,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BaseProps {
  onClose?: () => void;
  onOpen?: () => void;
  open?: boolean;
  onChange?: (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => void;
  max?: number;
  min?: number;
  snapPoints?: number[];
  scrollEnabled?: boolean;
}

interface ListProps extends BaseProps {
  flatListProps: FlatListProps<any>;
  children?: React.ReactNode;
}

interface CustomProps extends BaseProps {
  flatListProps?: never;
  children: React.ReactNode;
}

type Props = ListProps | CustomProps;

const BottomSheet = ({
  children,
  onClose,
  onOpen,
  open = false,
  onChange,
  max = 0.3,
  min = 0.1,
  snapPoints,
  flatListProps,
}: Props) => {
  const SHEET_HEIGHT = SCREEN_HEIGHT * max;

  const snapOffsets = snapPoints
    ? [
        ...snapPoints.map(s => SHEET_HEIGHT - SCREEN_HEIGHT * s),
        SHEET_HEIGHT, // Add fully closed offset when snapPoints are provided
      ]
    : [min, (max + min) / 2, max].map(s => SHEET_HEIGHT - SCREEN_HEIGHT * s);

  const sortedSnapOffsets = [...snapOffsets].sort((a, b) => a - b);

  const MAX_UPWARD_TRANSLATE_Y = Math.min(...sortedSnapOffsets);
  const MAX_DOWNWARD_TRANSLATE_Y = Math.max(...sortedSnapOffsets);

  const translateY = useRef(
    new Animated.Value(MAX_DOWNWARD_TRANSLATE_Y),
  ).current;

  const lastOffsetY = useRef(MAX_DOWNWARD_TRANSLATE_Y);

  const touchStartOffsetY = useRef(MAX_DOWNWARD_TRANSLATE_Y);

  const scrollOffset = useRef(0);
  const captureDy = useRef(0);

  useEffect(() => {
    const listenerId = translateY.addListener(({ value }) => {
      lastOffsetY.current = value;
    });
    return () => {
      translateY.removeListener(listenerId);
    };
  }, [translateY]);

  useEffect(() => {
    if (open) openBottomSheet();
    else closeBottomSheet();
  }, [open]);

  const openBottomSheet = () => {
    Animated.spring(translateY, {
      toValue: MAX_UPWARD_TRANSLATE_Y,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.spring(translateY, {
      toValue: MAX_DOWNWARD_TRANSLATE_Y,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dy } = gestureState;

        const sheetTop = SCREEN_HEIGHT - SHEET_HEIGHT + lastOffsetY.current;
        const relativeY = evt.nativeEvent.pageY - sheetTop;

        if (relativeY <= 140) {
          return Math.abs(dy) > 2;
        }

        if (lastOffsetY.current > MAX_UPWARD_TRANSLATE_Y + 5) {
          return Math.abs(dy) > 5;
        }

        // console.log(dy > 0, scrollOffset.current <= 0);
        if (dy > 0 && scrollOffset.current <= 0) {
          return true;
        }

        return false;
      },

      onPanResponderGrant: (evt, gestureState) => {
        translateY.stopAnimation();
        touchStartOffsetY.current = lastOffsetY.current;
        captureDy.current = gestureState.dy; // Record the dy at capture time!
      },

      onPanResponderMove: (event, gestureState) => {
        const relativeDy = gestureState.dy - captureDy.current;
        let nextValue = touchStartOffsetY.current + relativeDy;
        translateY.setValue(nextValue);
        onChange?.(event, gestureState);
      },

      onPanResponderRelease: (_, gestureState) => {
        const relativeDy = gestureState.dy - captureDy.current;
        const finalValue = touchStartOffsetY.current + relativeDy;

        // Ignore fast scroll velocity when capturing mid-gesture to prevent accidental close!
        const isMidGestureCapture = captureDy.current !== 0;
        const velocityMultiplier = isMidGestureCapture ? 0 : 75;
        const predictedY = finalValue + gestureState.vy * velocityMultiplier;

        let targetValue;

        if (snapPoints) {
          // Breakpoint Snapping Mode
          targetValue = sortedSnapOffsets.reduce((prev, curr) =>
            Math.abs(curr - predictedY) < Math.abs(prev - predictedY)
              ? curr
              : prev,
          );
        } else {
          if (scrollOffset.current <= 0 && relativeDy > 0) {
            targetValue = MAX_DOWNWARD_TRANSLATE_Y;
          } else {
            targetValue = sortedSnapOffsets.reduce((prev, curr) =>
              Math.abs(curr - predictedY) < Math.abs(prev - predictedY)
                ? curr
                : prev,
            );
          }
        }

        lastOffsetY.current = targetValue;
        if (targetValue === MAX_UPWARD_TRANSLATE_Y) {
          onOpen?.();
        } else if (targetValue === MAX_DOWNWARD_TRANSLATE_Y) {
          onClose?.();
        }

        Animated.spring(translateY, {
          toValue: targetValue,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY }], height: SHEET_HEIGHT },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
        {flatListProps ? (
          <FlatList
            {...flatListProps}
            onScroll={e => {
              scrollOffset.current = e.nativeEvent.contentOffset.y;
              flatListProps.onScroll?.(e);
            }}
          />
        ) : (
          children
        )}

        {/* <FlatList
          data={features}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScroll={e => {
            scrollOffset.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <View
                style={[
                  styles.itemNumberContainer,
                  { backgroundColor: item.color },
                ]}
              >
                <Text style={styles.itemNumber}>{index + 1}</Text>
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.desc}</Text>
              </View>
            </View>
          )}
        /> */}
        {/* <BottomSheetScrollView   onScroll={e => {scrollOffset.current = e.nativeEvent.contentOffset.y}} /> */}
      </Animated.View>
    </View>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  openButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
    zIndex: 99,
  },
  dragHandleContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  headerTextContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  bottomSheetText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
});
