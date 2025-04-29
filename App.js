import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

//Novo sistema de camera do Expo
import { CameraView, useCameraPermissions } from 'expo-camera';

//Importando a galeria
import * as MediaLibrary from 'expo-media-library'

export default function App() {
  //Estado para permissao da camera
  const [permissaoCamera, requestPermissaoCamera] = useCameraPermissions()

  //Estado para acessar a galeria
  const [permissaoGaleria, requestPermissaoGaleria] = MediaLibrary.usePermissions()

  //Referência direto ao componente
  const cameraRef = useRef(null)

  //Estado da foto capturada
  const [foto, setFoto] = useState(null)

  //Solicitar o acesso da galeria na inicialização do app
  useEffect(() => {
    if (permissaoGaleria === null) return;
    if (!permissaoGaleria?.granted) {
      requestPermissaoGaleria()
    }
  }, [])

  //Função para tirar foto
  const tirarFoto = async () => {
    if (cameraRef.current) {
      const dadoFoto = await cameraRef.current.takePictureAsync() //Captura a imagem atual
      setFoto(dadoFoto)
    }
  }

  //Função para salvar a foto
  const salvarFoto = async () => {
    if (foto?.uri) {
      try {
        await MediaLibrary.createAssetAsync(foto.uri) //Salva a imagem na galeria
        Alert.alert("Sucesso", "Foto salva com sucesso")
        setFoto(null)
      } catch (error) {
        Alert.alert("Error", "Não foi possivel salvar foto.")
      }
    }
  }

  //Enquanto a permissão não estiver carregada
  if (!permissaoCamera) return <View />

  //Se a permissão da câmera foi negada.
  if (!permissaoCamera?.granted) {
    return (
      <View>
        <Text>Permissão da câmera não foi concedida</Text>
        <Button title="Permitir" onPress={requestPermissaoCamera} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!foto ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <Button title='Tirar Foto' onPress={tirarFoto}/>
        </>
      ) : (
        <>
          <Image source={{uri:foto.uri}} style={styles.preview}/>
          <Button title='Salvar Foto' onPress={salvarFoto}/>
          <Button title='Tirar outra Foto' onPress={()=>setFoto(null)}/>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  preview:{
    flex:1,
    resizeMode:"cover"
  }
});
