import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ToDo from './ToDo';
import Done from './Done';

const MyTasks = () => {

    const Tab = createBottomTabNavigator()

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => null,
                tabBarIcon: ({ focused }) => {
                    let iconName
                    if (route.name === 'To-Do') {
                        iconName = "clipboard-clock-outline"
                    } else if (route.name === 'Done') {
                        iconName = "clipboard-check-outline"
                    }
                    return <MaterialCommunityIcons 
                        name={iconName} 
                        size={focused ? 35 : 30} 
                        color={focused ? "dodgerblue" : 'gray'}
                    />
                },
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {height: 60},
                tabBarLabelStyle: {fontSize: 12},
            })}>
            <Tab.Screen
                name='To-Do'
                component={ToDo}
                /*options={{
                    tabBarBadge: 3,
                }}*/
            />
            <Tab.Screen
                name='Done'
                component={Done}
            />
        </Tab.Navigator>
    );
}

export default MyTasks;
