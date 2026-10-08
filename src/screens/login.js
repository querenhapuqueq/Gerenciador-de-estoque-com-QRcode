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
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const { width, height } = useWindowDimensions();

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

          {/* CAIXA PRINCIPAL */}
          <View style={styles.caixa}>

            {/* LOGO */}
            <View style={styles.logoContainer}>
              <Image
                 source={require('../assets/icon.png')}
                 style={styles.logoImagem}
                 resizeMode="contain" />
            </View>


            {/* BEM VINDO */}
            <Text style={styles.bemVindo}>
              BEM VINDO!
            </Text>

            <Text style={styles.descricao}>
              Sistema de Gerenciamento de Estoque
            </Text>

            <View style={styles.linhaAzul} />


            {/* USUÁRIO */}
            <Text style={styles.label}>
              USUÁRIO:
            </Text>

            <View style={styles.inputContainer}>

              <Ionicons
                name="person"
                size={15}
                color="#000"
              />

              <TextInput
                style={styles.input}
                placeholder="E-MAIL"
                placeholderTextColor="#333"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

            </View>


            {/* SENHA */}
            <Text style={styles.labelSenha}>
              SENHA:
            </Text>

            <View style={styles.inputContainer}>

              <Ionicons
                name="lock-closed"
                size={14}
                color="#000"
              />

              <TextInput
                style={styles.input}
                placeholder="••••••••••••••"
                placeholderTextColor="#333"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarSenha(!mostrarSenha)
                }
              >

                <Ionicons
                  name={
                    mostrarSenha
                      ? 'eye-off'
                      : 'eye'
                  }
                  size={16}
                  color="#777"
                />

              </TouchableOpacity>

            </View>


            {/* ESQUECI SENHA */}
            <TouchableOpacity
              style={styles.esqueci}
            >

              <Text style={styles.esqueciTexto}>
                ESQUECI MINHA SENHA?
              </Text>

            </TouchableOpacity>


            {/* ENTRAR */}
            <TouchableOpacity
              style={styles.botao}
            >

              <Text style={styles.botaoTexto}>
                ENTRAR
              </Text>

            </TouchableOpacity>


            {/* OU */}
            <View style={styles.divisorContainer}>

              <View style={styles.divisor} />

              <Text style={styles.ou}>
                OU
              </Text>

              <View style={styles.divisor} />

            </View>


            {/* CRIAR CONTA */}
            <TouchableOpacity
              style={styles.criarConta}
              onPress={() => navigation.navigate('Cadastro')}
            >

              <Ionicons
                name="person-add"
                size={18}
                color="#000"
              />

              <Text style={styles.naoTem}>
                NÃO TENHO CONTA.{' '}
              </Text>

              <Text style={styles.criar}>
                CRIAR CONTA
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  /* TELA */

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


  /* TÍTULO */

  loginTitulo: {
    alignSelf: 'flex-start',

    marginBottom: 15,

    fontSize: 11,

    color: '#168bea',
  },


  /* CAIXA PRINCIPAL (PREENCHE A TELA TODA) */

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

  /* TEXTOS */

  bemVindo: {
    fontSize: 11,

    fontWeight: 'bold',

    color: '#111',

    marginTop: 4,
  },

  descricao: {
    fontSize: 10,

    color: '#222',

    marginTop: 6,

    textAlign: 'center',
  },

  linhaAzul: {
    width: 38,

    height: 3,

    backgroundColor: '#168bea',

    marginTop: 7,

    marginBottom: 28,
  },


  /* INPUTS */

  label: {
    alignSelf: 'flex-start',

    fontSize: 9,

    color: '#222',

    marginBottom: 5,
  },

  labelSenha: {
    alignSelf: 'flex-start',

    fontSize: 9,

    color: '#222',

    marginTop: 12,

    marginBottom: 5,
  },

  inputContainer: {
    width: '100%',

    height: 42,

    borderWidth: 1,

    borderColor: '#d5dbe0',

    borderRadius: 20,

    backgroundColor: '#fff',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 12,
  },

  input: {
    flex: 1,

    height: 42,

    fontSize: 12,

    color: '#111',

    marginLeft: 8,
  },


  /* ESQUECI SENHA */

  esqueci: {
    alignSelf: 'center',

    marginTop: 10,
  },

  esqueciTexto: {
    fontSize: 9,

    color: '#168bea',
  },


  /* BOTÃO */

  botao: {
    width: '80%',

    height: 42,

    backgroundColor: '#328de8',

    borderRadius: 9,

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 28,
  },

  botaoTexto: {
    fontSize: 12,

    fontWeight: 'bold',

    color: '#fff',
  },


  /* OU */

  divisorContainer: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 28,
  },

  divisor: {
    flex: 1,

    height: 1,

    backgroundColor: '#999',
  },

  ou: {
    fontSize: 9,

    color: '#333',

    marginHorizontal: 14,
  },


  /* CRIAR CONTA */

  criarConta: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 32,
  },

  naoTem: {
    fontSize: 10,

    color: '#168bea',

    marginLeft: 8,
  },

  criar: {
    fontSize: 10,

    color: '#111',

    fontWeight: 'bold',
  },

});