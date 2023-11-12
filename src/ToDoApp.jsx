import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import Splash from './screens/Splash';
import MyTasks from './screens/MyTasks';
import Task from './screens/Task';
import Camera from './screens/Camera';

const ToDoApp = () => {

    const [fontsLoaded, fontError] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
    });

    if (!fontsLoaded && !fontError) {
        return null
    }

    const Stack = createNativeStackNavigator()

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: styles.header,
                    headerTitleStyle: styles.headerText,
                    headerTitleAlign: 'center',
                    headerTintColor: 'white',
                }}>
                <Stack.Screen 
                    name='Splash'
                    component={Splash}
                    options={{
                        header: () => null
                    }}
                />
                <Stack.Screen 
                    name='My Tasks'
                    component={MyTasks}
                />
                <Stack.Screen 
                    name='Task'
                    component={Task}
                />
                <Stack.Screen 
                    name='Camera'
                    component={Camera}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 100,
        backgroundColor: 'dodgerblue',
    },
    headerText: {
        fontSize: 25,
        fontFamily: 'Montserrat_600SemiBold',
    },
})

export default ToDoApp;
