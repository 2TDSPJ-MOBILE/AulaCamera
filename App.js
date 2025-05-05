import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import React, { useState, useEffect, useRef, use } from 'react';

//Novo sistema de camera do Expo
import { CameraView, useCameraPermissions } from 'expo-camera';

//Importando a galeria
import * as MediaLibrary from 'expo-media-library'

//Importando o Expo-Sharing

import * as Sharing from 'expo-sharing'

export default function App() {
  //Estado para permissao da camera
  const [permissaoCamera, requestPermissaoCamera] = useCameraPermissions()

  //Estado para acessar a galeria
  const [permissaoGaleria, requestPermissaoGaleria] = MediaLibrary.usePermissions()

  //Referência direto ao componente
  const cameraRef = useRef(null)

  //Estado da foto capturada
  const [foto, setFoto] = useState(null)

  //Estado para alternar as camera
  const[isFrontCamera,setIsFrontCamera]=useState(false)

  //Estado para ligar ou desligar o flash
  const[flashLigado,setFlashLigado]=useState(false)

  //Estado para configurar o scaneamento
  const[scaneado,setScaneado] = useState(false)


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

  //Função para alternar as cameras da aplicação
  const alternarCamera  = () =>{
    setIsFrontCamera(!isFrontCamera)
  }

  //Função para ativar ou desativar o flash
  const alternarFlash = () => {
    setFlashLigado(!flashLigado)
  }

  //Função para compartilhar foto com o Sharing
  const compartilharFoto = async() =>{
    if(foto?.uri && await Sharing.isAvailableAsync()){
      await Sharing.shareAsync(foto.uri)
    }else{
      Alert.alert("Error","Compartilhamento não disponível no dispositivo")
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
            facing={isFrontCamera?'front':'back'}
            flash={flashLigado?'on':'off'}
            onBarcodeScanned={({type,data})=>{
              if(!scaneado){
                setScaneado(true)
                Alert.alert("Código Dectado",`Tipo:${type}\nValor:${data}`)
              }
            }}
          />
          <Button title='Tirar Foto' onPress={tirarFoto}/>
          <Button title='Alternar Camera' onPress={alternarCamera}/>
          <Button title={flashLigado?'Desligar Flash':'Ligar Flash'} onPress={alternarFlash}/>
          {scaneado && (
            <Button title='Escanear Novamente' onPress={()=>setScaneado(false)}/>)}
        </>
      ) : (
        <>
          <Image source={{uri:foto.uri}} style={styles.preview}/>
          <Button title='Salvar Foto' onPress={salvarFoto}/>
          <Button title='Tirar outra Foto' onPress={()=>setFoto(null)}/>
          <Button title='Compartilhar Foto' onPress={compartilharFoto}/>
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
    flex:1
  },
  preview:{
    flex:1,
    resizeMode:"cover"
  }
});
