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
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cadastrarProduto } from '../database/database';

export default function CadastroTecidoScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [cor, setCor] = useState('');
  const [tamanho, setTamanho] = useState(''); // Ex: Largura 1,50m
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('metros');
  const [preco, setPreco] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [salvando, setSalvando] = useState(false);

  const unidadesDisponiveis = ['metros', 'kg', 'rolos'];

  // Gera um código único caso o rolo ainda não tenha etiqueta
  const gerarCodigoAutomatico = () => {
    const timestamp = Date.now().toString().slice(-6);
    const aleatorio = Math.floor(100 + Math.random() * 900);
    setQrCode(`TEC-${timestamp}-${aleatorio}`);
  };

  const handleSalvarTecido = async () => {
    if (salvando) return;

    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do tecido.');
      return;
    }

    const qtdLimpa = parseFloat(quantidade.replace(',', '.'));
    if (!quantidade || isNaN(qtdLimpa) || qtdLimpa <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida maior que zero.');
      return;
    }

    setSalvando(true);

    try {
      await cadastrarProduto({
        nome,
        tipo,
        cor,
        tamanho,
        quantidade,
        unidade,
        preco,
        qr_code: qrCode
      });

      Alert.alert('Sucesso!', 'Tecido cadastrado no estoque.', [
        {
          text: 'Cadastrar outro',
          onPress: () => {
            setNome('');
            setTipo('');
            setCor('');
            setTamanho('');
            setQuantidade('');
            setPreco('');
            setQrCode('');
          }
        },
        {
          text: 'Voltar',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error.message || 'Não foi possível salvar o tecido.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>CADASTRAR TECIDO</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.caixa}>
            <Text style={styles.subtitulo}>Informações do Material</Text>
            <View style={styles.linhaAzul} />

            {/* NOME DO TECIDO */}
            <Text style={styles.label}>NOME DO TECIDO: *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Linho Misto, Brim Pesado, Algodão..."
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* TIPO E COR (LADO A LADO) */}
            <View style={styles.linhaDupla}>
              <View style={styles.colunaMetade}>
                <Text style={styles.label}>TIPO / COMPOSIÇÃO:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 100% Algodão"
                    placeholderTextColor="#888"
                    value={tipo}
                    onChangeText={setTipo}
                  />
                </View>
              </View>

              <View style={styles.colunaMetade}>
                <Text style={styles.label}>COR / ESTAMPA:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Azul Marinho"
                    placeholderTextColor="#888"
                    value={cor}
                    onChangeText={setCor}
                  />
                </View>
              </View>
            </View>

            {/* LARGURA / TAMANHO */}
            <Text style={styles.label}>LARGURA / GRAMATURA:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 1,50m de largura"
                placeholderTextColor="#888"
                value={tamanho}
                onChangeText={setTamanho}
              />
            </View>

            {/* UNIDADE DE MEDIDA */}
            <Text style={styles.label}>UNIDADE DE MEDIDA:</Text>
            <View style={styles.unidadeContainer}>
              {unidadesDisponiveis.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.unidadeBotao,
                    unidade === item && styles.unidadeBotaoAtivo
                  ]}
                  onPress={() => setUnidade(item)}
                >
                  <Text
                    style={[
                      styles.unidadeTexto,
                      unidade === item && styles.unidadeTextoAtivo
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* QUANTIDADE E PREÇO (LADO A LADO) */}
            <View style={styles.linhaDupla}>
              <View style={styles.colunaMetade}>
                <Text style={styles.label}>QUANTIDADE ({unidade.toUpperCase()}): *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 45,5"
                    placeholderTextColor="#888"
                    value={quantidade}
                    onChangeText={setQuantidade}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.colunaMetade}>
                <Text style={styles.label}>PREÇO POR {unidade.toUpperCase()} (R$):</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 29,90"
                    placeholderTextColor="#888"
                    value={preco}
                    onChangeText={setPreco}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* CÓDIGO QR */}
            <Text style={styles.label}>CÓDIGO QR / ETIQUETA:</Text>
            <View style={styles.qrRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Ionicons name="qr-code-outline" size={16} color="#555" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite ou gere um código"
                  placeholderTextColor="#888"
                  value={qrCode}
                  onChangeText={setQrCode}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                style={styles.botaoGerarQr}
                onPress={gerarCodigoAutomatico}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
                <Text style={styles.textoGerarQr}>GERAR</Text>
              </TouchableOpacity>
            </View>

            {/* BOTÃO SALVAR */}
            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={handleSalvarTecido}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>SALVAR TECIDO</Text>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  botaoVoltar: {
    padding: 4,
  },
  headerTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  caixa: {
    width: '100%',
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  subtitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  linhaAzul: {
    width: 40,
    height: 3,
    backgroundColor: '#168bea',
    marginTop: 5,
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 12,
  },
  inputContainer: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#d5dbe0',
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#111',
  },
  linhaDupla: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  colunaMetade: {
    flex: 1,
  },
  unidadeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unidadeBotao: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d5dbe0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unidadeBotaoAtivo: {
    backgroundColor: '#168bea',
    borderColor: '#168bea',
  },
  unidadeTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  unidadeTextoAtivo: {
    color: '#fff',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoGerarQr: {
    height: 42,
    paddingHorizontal: 14,
    backgroundColor: '#168bea',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  textoGerarQr: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  botaoSalvar: {
    width: '100%',
    height: 45,
    backgroundColor: '#328de8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  botaoDesabilitado: {
    backgroundColor: '#7bb3f0',
  },
  botaoSalvarTexto: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    includeFontPadding: false,
  },
});