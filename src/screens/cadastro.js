import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Função para realizar o cadastro e navegar até a Home
  const handleCadastrar = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  // Função para voltar ao Login
  const handleIrParaLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.caixa}>
            {/* LOGO DA EMPRESA */}
            <View style={styles.logoContainer}>
              <Image
                 source={require('../assets/icon.png')}
                 style={styles.logoImagem}
                 resizeMode="contain" />
            </View>

            {/* SUBTÍTULO */}
            <Text style={styles.descricao}>
              Sistema de Gerenciamento de Estoque
            </Text>
            <View style={styles.linhaAzul} />

            {/* CAMPO: NOME */}
            <Text style={styles.label}>NOME:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="DIGITE SEU NOME"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* CAMPO: E-MAIL */}
            <Text style={styles.label}>E-MAIL:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="DIGITE SEU E-MAIL"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* CAMPO: SENHA */}
            <Text style={styles.label}>SENHA:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="DIGITE SUA SENHA"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            {/* CAMPO: CONFIRMAR SENHA */}
            <Text style={styles.label}>CONFIRMAR SENHA:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="DIGITE SUA SENHA NOVAMENTE"
                placeholderTextColor="#888"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />
            </View>

            {/* BOTÃO CADASTRAR (VAI PARA A HOME) */}
            <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
              <Text style={styles.botaoTexto}>CADASTRAR</Text>
            </TouchableOpacity>

            {/* DIVISOR OU */}
            <View style={styles.divisorContainer}>
              <View style={styles.divisor} />
              <Text style={styles.ou}>OU</Text>
              <View style={styles.divisor} />
            </View>

            {/* JÁ TENHO CONTA / ENTRAR */}
            <TouchableOpacity style={styles.loginLink} onPress={handleIrParaLogin}>
              <Ionicons name="person" size={20} color="#000" />
              <Text style={styles.jaTenhoConta}>JÁ TENHO CONTA! </Text>
              <Text style={styles.entrarTexto}>ENTRAR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  caixa: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: '8%',
    paddingTop: 20,
    paddingBottom: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* TÍTULO */
  cadastroTitulo: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },

  /* LOGO */
  logoContainer: {
  width: 95,
  height: 90,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  borderRadius: 8,
},

logoImagem: {
  width: '80%',
  height: '80%',
},

  /* TEXTO CENTRAL */
  descricao: {
    fontSize: 11,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  linhaAzul: {
    width: 45,
    height: 3,
    backgroundColor: '#168bea',
    marginTop: 5,
    marginBottom: 20,
  },

  /* FORMULÁRIO */
  label: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 8,
  },
  inputContainer: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#d5dbe0',
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 11,
    color: '#111',
  },

  /* BOTÃO PRINCIPAL */
  botao: {
    width: '75%',
    height: 42,
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  botaoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },

  /* DIVISOR */
  divisorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  divisor: {
    flex: 1,
    height: 1,
    backgroundColor: '#555',
  },
  ou: {
    fontSize: 9,
    color: '#333',
    marginHorizontal: 15,
  },

  /* LINK LOGIN */
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  jaTenhoConta: {
    fontSize: 10,
    color: '#3b82f6',
    marginLeft: 8,
  },
  entrarTexto: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
  },
});