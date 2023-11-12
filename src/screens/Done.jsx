import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { setTasks } from '../redux/actions';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

const Done = ({ navigation }) => {

    const { tasks } = useSelector(state => state.taskReducer)
    const dispatch = useDispatch()

    useEffect(() => {
        getTasks()
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

    const openTask = myTaskID => {
        navigation.navigate('Task', {
            myTaskID: myTaskID,
        })
    }

    const deleteTask = myTaskID => {
        const filteredTasks = tasks.filter(currentTask => currentTask.taskID !== myTaskID)
        dispatch(setTasks(filteredTasks))
        AsyncStorage.setItem('tasks', JSON.stringify(filteredTasks))
            .then(result => Alert.alert('Success', 'The task has been deleted'))
            .catch(error => Alert.alert('Error', 'Failed deleting the task: ' + error))
    }

    const setDone = myTaskID => {
        const taskIndex = tasks.findIndex(currentTask => currentTask.taskID === myTaskID)
        tasks[taskIndex].done = !tasks[taskIndex].done
        dispatch(setTasks(tasks))
        AsyncStorage.setItem('tasks', JSON.stringify(tasks))
            .then(result => Alert.alert('Success', 'The task has been updated'))
            .catch(error => Alert.alert('Error', 'Failed updating the task: ' + error))
    }

    return (
        <View style={styles.body}>
            <FlatList
                data={tasks.filter(task => task.done === true)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: item.color }]}>
                        <View style={styles.checkboxContainer}>
                            <Checkbox 
                                value={item.done} 
                                onValueChange={() => setDone(item.taskID)} 
                                style={styles.checkbox}
                                color={item.done ? 'dodgerblue' : undefined}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.cardContent}
                            onPress={() => openTask(item.taskID)}>
                            <View style={styles.cardTextContainer}>
                                <Text
                                    style={styles.cardTitle}
                                    numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text
                                    style={styles.cardText}
                                    numberOfLines={1}>
                                    {item.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => deleteTask(item.taskID)}>
                            <Feather name="trash-2" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.button} onPress={() => openTask(0)}>
                <Entypo name="plus" size={40} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'dodgerblue',
        borderRadius: 20,
        elevation: 5,
        zIndex: 99,
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        width: 370,
        marginTop: 25,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTextContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    cardTitle: {
        paddingVertical: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardText: {
        paddingBottom: 10,
        fontSize: 15,
    },
    deleteButton: {
        justifyContent: 'center',
        marginRight: 15,
    },
    checkboxContainer: {
        justifyContent: 'center',
        marginLeft: 15,
    },
})

export default Done;
