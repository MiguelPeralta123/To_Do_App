import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, TextInput, Alert, Text, TouchableOpacity, Image, Modal } from 'react-native';
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

    const { myTaskID, imagePath } = route.params

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(undefined);
    const [image, setImage] = useState('');
    const [done, setDone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [minutes, setMinutes] = useState('');

    // PUSH NOTIFICATIONS
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        navigation.addListener('focus', () => {
            getTasks()
        })
        
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
        if (myTaskID > 0) {
            const task = tasks.find(currentTask => {
                return currentTask.taskID === myTaskID
            })
            if (task) {
                dispatch(setTaskID(myTaskID))
                setTitle(task.title)
                setDescription(task.description)
                setColor(task.color)
                setImage(task.image)
                setDone(task.done)
            }
        }
        else {
            dispatch(setTaskID(tasks.length + 1))
            if (imagePath) {
                setImage(imagePath)
                console.log('Hola desde setImage')
            }
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
                image: image,
                done: done,
            }
            let successText
            let errorText
            // If the task already exists, find and update it
            if (myTaskID > 0) {
                const taskIndex = tasks.findIndex(currentTask => currentTask.taskID === myTaskID)
                tasks[taskIndex] = newTask
                successText = 'Task updated successfully'
                errorText = 'Failed updating the task\n'
            }
            // Else, add it to the tasks array
            else {
                tasks.push(newTask)
                successText = 'Task created successfully'
                errorText = 'Failed creating the task\n'
            }
            dispatch(setTasks(tasks))
            AsyncStorage.setItem('tasks', JSON.stringify(tasks))
                .then(/*result => Alert.alert('Success', successText)*/)
                .catch(error => Alert.alert('Error', errorText + error))
            navigation.navigate('My Tasks')
        }
        catch(error) {
            console.log(error)
        }
    }

    const scheduleNotification = async () => {
        if (minutes.length < 1) {
            Alert.alert('Warning', 'Please write a valid value for minutes')
            return
        }
        if (title.length < 1) {
            Alert.alert('Warning', 'Please write a title')
            setModalVisible(false)
            return
        }
        if (description.length < 1) {
            Alert.alert('Warning', 'Please write a description')
            setModalVisible(false)
            return
        }
        try {
            setModalVisible(false)
            await schedulePushNotification()
            Alert.alert('Success', 'The remainder will be sent in ' + minutes + ' minutes')
        } catch (error) {
            Alert.alert('Warning', 'Failed setting the remainder\n' + error)
        }
    }

    const deleteImage = () => {
        setImage(undefined)
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
        <ScrollView>
            <View style={styles.body}>
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
                            {
                                color == 'lightyellow' ? 
                                <View style={
                                    [styles.colorChecked, 
                                    { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }]
                                }>
                                    <Feather name="check" size={35} color="white" />
                                </View>
                                :
                                null
                            }
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.colorButtonBlue}
                            onPress={() => setColor('lightblue')}>
                            {
                                color == 'lightblue' ? 
                                <View style={styles.colorChecked}>
                                    <Feather name="check" size={35} color="white" />
                                </View>
                                :
                                null
                            }
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.colorButtonPink}
                            onPress={() => setColor('lightpink')}>
                            {
                                color == 'lightpink' ? 
                                <View style={styles.colorChecked}>
                                    <Feather name="check" size={35} color="white" />
                                </View>
                                :
                                null
                            }
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.colorButtonGreen}
                            onPress={() => setColor('lightgreen')}>
                            {
                                color == 'lightgreen' ? 
                                <View style={
                                    [styles.colorChecked, 
                                    { borderTopRightRadius: 10, borderBottomRightRadius: 10 }]
                                }>
                                    <Feather name="check" size={35} color="white" />
                                </View>
                                :
                                null
                            }
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.taskButtonsContainer}>
                    <TouchableOpacity 
                        style={myTaskID > 0 ? styles.taskButton : styles.taskButtonFullWidth}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
                        <Text style={styles.btnReminderText}>Set reminder</Text>
                    </TouchableOpacity>
                    
                    {
                        myTaskID > 0 ? 
                        <TouchableOpacity 
                            style={styles.taskButton}
                            onPress={() => navigation.navigate('Camera', { 
                                myTaskID: taskID
                            })}
                        >
                            <Feather name="camera" size={24} color="white" />
                            <Text style={styles.btnReminderText}>Take photo</Text>
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>

                {image ? 
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: image }} />
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={deleteImage}
                        >
                            <Feather name="trash-2" size={24} color="white" />
                        </TouchableOpacity>
                    </View> 
                    : 
                    null
                }

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
        </ScrollView>
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
        backgroundColor: '#00000090',
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
    colorChecked: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000040',
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
    taskButtonFullWidth: {
        width: '100%',
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
    imageContainer: {
        width: 250,
        marginTop: 20,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 15,
    },
    deleteButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FF000080',
    },
    checkboxContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        marginTop: 20,
    },
})

export default Task;
