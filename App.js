import 'react-native-gesture-handler'; // <-- Sempre na primeira linha
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { inicializarBanco } from './src/database/database';

import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/cadastro';
import HomeScreen from './src/screens/home';
import CadastroTecidoScreen from './src/screens/cadastroTecido';
import ListaTecidosScreen from './src/screens/listaTecidos';
import HistoricoMovimentacoesScreen from './src/screens/historicoMovimentacoes';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    inicializarBanco()
      .catch(error => console.error('Erro no banco:', error));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CadastroTecido" component={CadastroTecidoScreen} />
        <Stack.Screen name="ListaTecidos" component={ListaTecidosScreen} />
        <Stack.Screen
          name="HistoricoMovimentacoes"
          component={HistoricoMovimentacoesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}