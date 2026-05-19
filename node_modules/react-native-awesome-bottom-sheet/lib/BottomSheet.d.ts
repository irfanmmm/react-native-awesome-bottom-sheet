import React from 'react';
import { PanResponderGestureState, FlatListProps, GestureResponderEvent } from 'react-native';
interface BaseProps {
    onClose?: () => void;
    onOpen?: () => void;
    open?: boolean;
    onChange?: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
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
declare const BottomSheet: ({ children, onClose, onOpen, open, onChange, max, min, snapPoints, flatListProps, }: Props) => React.JSX.Element;
export default BottomSheet;
