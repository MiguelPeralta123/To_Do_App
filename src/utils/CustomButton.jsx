import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const CustomButton = (props) => {
    return (
        <TouchableOpacity 
            style={[styles.button, props.styles]} 
            onPress={props.handlePress}>
            <Text style={styles.text}>{props.title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        padding: 10,
        alignItems: 'center',
        borderRadius: 15,
    },
    text: {
        fontSize: 20,
        color: 'white',
    },
})

export default CustomButton;
