import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

const Splash = ({ navigation }) => {
    
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('My Tasks')
        }, 1500)
    }, []);

    const [fontsLoaded, fontError] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
    });

    if (!fontsLoaded && !fontError) {
        return null
    }

    return (
        <View style={styles.body}>
            <Image style={styles.image} source={require('../../assets/checklist.png')} />
            <Text style={styles.text_bold}>To-Do App</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        backgroundColor: 'dodgerblue',
    },
    image: {
        width: 200,
        height: 200,
        objectFit: 'contain',
    },
    text: {
        fontSize: 40,
        fontFamily: 'Montserrat_400Regular',
        color: 'white',
    },
    text_bold: {
        fontSize: 40,
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
    },
})

export default Splash;
