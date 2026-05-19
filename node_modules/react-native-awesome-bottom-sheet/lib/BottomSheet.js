"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const { height: SCREEN_HEIGHT } = react_native_1.Dimensions.get('window');
const BottomSheet = ({ children, onClose, onOpen, open = false, onChange, max = 0.3, min = 0.1, snapPoints, flatListProps, }) => {
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
    const translateY = (0, react_1.useRef)(new react_native_1.Animated.Value(MAX_DOWNWARD_TRANSLATE_Y)).current;
    const lastOffsetY = (0, react_1.useRef)(MAX_DOWNWARD_TRANSLATE_Y);
    const touchStartOffsetY = (0, react_1.useRef)(MAX_DOWNWARD_TRANSLATE_Y);
    const scrollOffset = (0, react_1.useRef)(0);
    const captureDy = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        const listenerId = translateY.addListener(({ value }) => {
            lastOffsetY.current = value;
        });
        return () => {
            translateY.removeListener(listenerId);
        };
    }, [translateY]);
    (0, react_1.useEffect)(() => {
        if (open)
            openBottomSheet();
        else
            closeBottomSheet();
    }, [open]);
    const openBottomSheet = () => {
        react_native_1.Animated.spring(translateY, {
            toValue: MAX_UPWARD_TRANSLATE_Y,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    };
    const closeBottomSheet = () => {
        react_native_1.Animated.spring(translateY, {
            toValue: MAX_DOWNWARD_TRANSLATE_Y,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    };
    const panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
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
                targetValue = sortedSnapOffsets.reduce((prev, curr) => Math.abs(curr - predictedY) < Math.abs(prev - predictedY)
                    ? curr
                    : prev);
            }
            else {
                if (scrollOffset.current <= 0 && relativeDy > 0) {
                    targetValue = MAX_DOWNWARD_TRANSLATE_Y;
                }
                else {
                    targetValue = sortedSnapOffsets.reduce((prev, curr) => Math.abs(curr - predictedY) < Math.abs(prev - predictedY)
                        ? curr
                        : prev);
                }
            }
            lastOffsetY.current = targetValue;
            if (targetValue === MAX_UPWARD_TRANSLATE_Y) {
                onOpen?.();
            }
            else if (targetValue === MAX_DOWNWARD_TRANSLATE_Y) {
                onClose?.();
            }
            react_native_1.Animated.spring(translateY, {
                toValue: targetValue,
                useNativeDriver: true,
                bounciness: 4,
            }).start();
        },
    })).current;
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Animated.View style={[
            styles.bottomSheet,
            { transform: [{ translateY }], height: SHEET_HEIGHT },
        ]} {...panResponder.panHandlers}>
        <react_native_1.View style={styles.dragHandleContainer}>
          <react_native_1.View style={styles.dragHandle}/>
        </react_native_1.View>
        {flatListProps ? (<react_native_1.FlatList {...flatListProps} onScroll={e => {
                scrollOffset.current = e.nativeEvent.contentOffset.y;
                flatListProps.onScroll?.(e);
            }}/>) : (children)}

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
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
exports.default = BottomSheet;
const styles = react_native_1.StyleSheet.create({
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
