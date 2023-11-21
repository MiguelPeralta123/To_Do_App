import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { setTasks, setTaskID } from '../redux/actions';

export default function App({ navigation, route }) {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState(null);

  const { tasks, taskID } = useSelector(state => state.taskReducer)
  const dispatch = useDispatch()

  const { myTaskID } = route.params

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await requestCameraPermission();
      const mediaLibraryPermission = await requestMediaLibraryPermission();
      
      if (cameraPermission && mediaLibraryPermission) {
        // Both camera and media library permissions granted
      } else {
        // Handle permission denial
      }
    })();
  }, []);

  function toggleCameraType() {
    setType(current => current === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
  }

  const handleCapture = async () => {
    if (camera) {
      const image = await camera.takePictureAsync();
      if (image) {
        const imagePath = image.uri
        const taskIndex = tasks.findIndex(currentTask => currentTask.taskID === myTaskID)
        if (taskIndex > -1) {
          tasks[taskIndex].image = imagePath
          dispatch(setTasks(tasks))
          AsyncStorage.setItem('tasks', JSON.stringify(tasks))
              .then(/*result => Alert.alert('Success', 'Photo saved successfully')*/)
              .catch(error => Alert.alert('Error', 'Failed saving the photo, try again later\n' + error))
        }
        navigation.goBack()
      }
    }
  };

  return (
    <View style={styles.container}>
        <Camera
            style={styles.camera}
            type={type}
            ref={(ref) => setCamera(ref)}
        >
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                <Ionicons name="camera-reverse" size={50} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={handleCapture}>
                <MaterialIcons name="camera" size={50} color="white" />
                </TouchableOpacity>
            </View>
        </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 50,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});