import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState(null);

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
      const photo = await camera.takePictureAsync();
      if (photo) {
        // Save the captured photo to the device's media library
        //const asset = await MediaLibrary.createAssetAsync(photo.uri);

        // You can access the saved photo's URI via asset.uri
        // TODO Instead of printing the photo path, save it as a task property, go back to task component and display the photo below the camera button
        //console.log('Photo captured and saved:', asset.uri);
        const photoPath = photo.uri
        console.log(photoPath)
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