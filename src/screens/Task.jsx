import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Alert, Text, TouchableOpacity, Modal } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { setTasks, setTaskID } from '../redux/actions';
import CustomButton from '../utils/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

// PUSH NOTIFICATIONS
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const Task = ({ navigation, route }) => {

    const { tasks, taskID } = useSelector(state => state.taskReducer)
    const dispatch = useDispatch()

    const { myTaskID } = route.params

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(undefined);
    const [done, setDone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [minutes, setMinutes] = useState('');

    // PUSH NOTIFICATIONS
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        getTasks()
        if (myTaskID > 0) {
            const task = tasks.find(currentTask => {
                return currentTask.taskID === myTaskID
            })
            if (task) {
                dispatch(setTaskID(myTaskID))
                setTitle(task.title)
                setDescription(task.description)
                setColor(task.color)
                setDone(task.done)
            }
        }
        else {
            dispatch(setTaskID(tasks.length + 1))
        }

        // PUSH NOTIFICATIONS
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });
        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [])

    const getTasks = () => {
        try {
            AsyncStorage.getItem('tasks')
                .then(tasks => {
                    if (tasks !== null) {
                        const parsedTasks = JSON.parse(tasks)
                        if (parsedTasks && typeof parsedTasks === 'object') {
                            dispatch(setTasks(parsedTasks))
                        }
                    }
                })
                .catch(error => console.log(error))
        }
        catch (error) {
            console.log(error)
        }
    }

    const saveTask = () => {
        if (title.length === 0) {
            Alert.alert('Warning', 'Please write a title')
            return
        }
        if (description.length === 0) {
            Alert.alert('Warning', 'Please write a description')
            return
        }
        try {
            const newTask = {
                taskID: taskID,
                title: title,
                description: description,
                color: color,
                done: done,
            }
            let successText
            let errorText
            // If the task already exists, find and update it
            if (myTaskID > 0) {
                const taskIndex = tasks.findIndex(currentTask => currentTask.taskID === myTaskID)
                tasks[taskIndex] = newTask
                successText = 'Task updated successfully'
                errorText = 'Failed updating the task: '
            }
            // Else, add it to the tasks array
            else {
                tasks.push(newTask)
                successText = 'Task created successfully'
                errorText = 'Failed creating the task: '
            }
            dispatch(setTasks(tasks))
            AsyncStorage.setItem('tasks', JSON.stringify(tasks))
                .then(result => Alert.alert('Success', successText))
                .catch(error => Alert.alert('Error', errorText + error))
            navigation.navigate('My Tasks')
        }
        catch(error) {
            console.log(error)
        }
    }

    const scheduleNotification = async () => {
        if (minutes.length < 1) {
            Alert.alert('Warning', 'Enter a valid value for minutes')
            return
        }
        if (title.length < 1) {
            Alert.alert('Warning', 'Enter a valid task title')
            setModalVisible(false)
            return
        }
        if (description.length < 1) {
            Alert.alert('Warning', 'Enter a valid task description')
            setModalVisible(false)
            return
        }
        try {
            setModalVisible(false)
            await schedulePushNotification()
            Alert.alert('Success', 'The remainder will be sent in ' + minutes + ' minutes')
        } catch (error) {
            Alert.alert('Warning', 'Failed sending push notification: ' + error)
        }
    }

    // PUSH NOTIFICATIONS
    async function schedulePushNotification() {
        await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: description,
        },
        trigger: { seconds: parseInt(minutes) * 60 },
        });
    }
    async function registerForPushNotificationsAsync() {
        let token;
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            // Learn more about projectId:
            // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
            token = (await Notifications.getExpoPushTokenAsync({ projectId: 'a6372fdb-a092-4f64-937f-18e957bebe25' })).data;
        } else {
            alert('Must use physical device for Push Notifications');
        }
        return token;
    }

    return (
        <View style={[styles.body, { backgroundColor: color }]}>
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modal}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Remind me after</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={minutes}
                                keyboardType='numeric'
                                onChangeText={value => setMinutes(value)}
                            />
                            <Text style={styles.modalText}>minutes</Text>
                        </View>

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity 
                                style={[styles.modalButton, { borderBottomLeftRadius: 20 }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: 'red' }]}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.modalButton, { borderBottomRightRadius: 20 }]}
                                onPress={scheduleNotification}
                            >
                                <Text style={[styles.modalButtonText, { color: 'dodgerblue' }]}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TextInput 
                style={styles.title} 
                placeholder='Title' 
                value={title}
                onChangeText={value => setTitle(value)}
            />

            <TextInput 
                style={styles.description} 
                placeholder='Description' 
                value={description}
                onChangeText={value => setDescription(value)}
                multiline 
            />

            <View style={styles.colorContainer}>
                <Text style={styles.colorText}>Color</Text>
                <View style={styles.colorButtons}>
                    <TouchableOpacity 
                        style={styles.colorButtonYellow} 
                        onPress={() => setColor('lightyellow')}>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.colorButtonBlue}
                        onPress={() => setColor('lightblue')}>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.colorButtonPink}
                        onPress={() => setColor('lightpink')}>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.colorButtonGreen}
                        onPress={() => setColor('lightgreen')}>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.taskButtonsContainer}>
                <TouchableOpacity 
                    style={styles.taskButton}
                    onPress={() => setModalVisible(true)}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
                    <Text style={styles.btnReminderText}>Set reminder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.taskButton}
                    onPress={() => navigation.navigate('Camera')}
                >
                    <Feather name="camera" size={24} color="white" />
                    <Text style={styles.btnReminderText}>Take photo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
                <Checkbox 
                    value={done} 
                    onValueChange={setDone} 
                    color={done ? 'dodgerblue' : undefined}
                />
                <Text style={
                    {fontSize: 15, color: done ? 'dodgerblue' : undefined}}>Done</Text>
            </View>

            <CustomButton 
                title='Save' 
                styles={{backgroundColor: 'dodgerblue', marginTop: 20}} 
                handlePress={saveTask}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000080',
    },
    modal: {
        width: 350,
        height: 210,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    modalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalText: {
        fontSize: 22,
    },
    modalInput: {
        width: 60,
        marginVertical: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        textAlign: 'center',
        fontSize: 20,
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 10,
    },
    modalButtonsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    modalButton: {
        width: '50%',
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
    },
    modalButtonText: {
        fontSize: 20,
    },
    title: {
        width: "100%",
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        fontSize: 20,
        backgroundColor: 'white',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 10,
    },
    description: {
        width: "100%",
        height: 200,
        textAlignVertical: 'top',
        marginTop: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        fontSize: 20,
        backgroundColor: 'white',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 10,
    },
    colorContainer: {
        width: "100%",
        marginTop: 20,
        paddingHorizontal: 5,
        gap: 2,
    },
    colorText: {
        fontSize: 15,
    },
    colorButtons: {
        display: 'flex',
        flexDirection: 'row',
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 10,
    },
    colorButtonYellow: {
        width: '25%',
        height: 50,
        backgroundColor: 'lightyellow',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    colorButtonBlue: {
        width: '25%',
        height: 50,
        backgroundColor: 'lightblue',
    },
    colorButtonPink: {
        width: '25%',
        height: 50,
        backgroundColor: 'lightpink',
    },
    colorButtonGreen: {
        width: '25%',
        height: 50,
        backgroundColor: 'lightgreen',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    taskButtonsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskButton: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 15,
    },
    btnReminderText: {
        fontSize: 16,
        color: 'white',
    },
    checkboxContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        marginTop: 20,
    },
})

export default Task;
