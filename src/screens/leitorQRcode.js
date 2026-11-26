import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  buscarProdutoPorQrCode,
  registrarMovimentacao
} from '../database/database';

export default function LeitorQrCodeScreen({ navigation }) {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [lanternaAtiva, setLanternaAtiva] = useState(false);
  const isFocused = useIsFocused();

  // Estados do modal de movimentação após leitura
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tecidoEncontrado, setTecidoEncontrado] = useState(null);
  const [tipoMovimento, setTipoMovimento] = useState('saida');
  const [qtdMovimento, setQtdMovimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  const handleCodigoLido = async ({ data }) => {
    if (escaneado) return;
    setEscaneado(true);

    try {
      const produto = await buscarProdutoPorQrCode(data);

      if (!produto) {
        Alert.alert(
          'QR Code não cadastrado',
          `Nenhum tecido encontrado com o código:\n"${data}"`,
          [
            {
              text: 'Ler novamente',
              onPress: () => setEscaneado(false)
            },
            {
              text: 'Cadastrar agora',
              onPress: () => navigation.replace('CadastroTecido')
            }
          ]
        );
        return;
      }

      setTecidoEncontrado(produto);
      setTipoMovimento('saida');
      setQtdMovimento('');
      setObservacao('');
      setModalVisivel(true);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao consultar o código QR no banco de dados.');
      setEscaneado(false);
    }
  };

  const handleConfirmarMovimentacao = async () => {
    if (processando || !tecidoEncontrado) return;

    const valor = parseFloat(qtdMovimento.replace(',', '.'));
    if (!qtdMovimento || isNaN(valor) || valor <= 0) {
      Alert.alert('Atenção', 'Digite uma quantidade válida maior que zero.');
      return;
    }

    setProcessando(true);
    try {
      const novoSaldo = await registrarMovimentacao({
        produtoId: tecidoEncontrado.id,
        tipo: tipoMovimento,
        quantidade: qtdMovimento,
        observacao
      });

      setModalVisivel(false);
      Alert.alert(
        'Estoque Atualizado!',
        `${tecidoEncontrado.nome}\nNovo saldo: ${String(novoSaldo).replace('.', ',')} ${tecidoEncontrado.unidade}`,
        [
          {
            text: 'Ler outro QR Code',
            onPress: () => {
              setTecidoEncontrado(null);
              setEscaneado(false);
            }
          },
          {
            text: 'Voltar para Home',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Não foi possível movimentar', error.message || 'Erro ao atualizar estoque.');
    } finally {
      setProcessando(false);
    }
  };

  const fecharModalERetomarLeitura = () => {
    setModalVisivel(false);
    setTecidoEncontrado(null);
    setEscaneado(false);
  };

  if (!permissao) {
    return (
      <View style={styles.centroPermissao}>
        <ActivityIndicator size="large" color="#168bea" />
      </View>
    );
  }

  if (!permissao.granted) {
    return (
      <SafeAreaView style={styles.containerPermissao}>
        <MaterialCommunityIcons name="camera-off-outline" size={60} color="#168bea" />
        <Text style={styles.tituloPermissao}>Acesso à Câmera Necessário</Text>
        <Text style={styles.textoPermissao}>
          Precisamos da câmera para escanear as etiquetas QR Code dos rolos de tecido.
        </Text>
        <TouchableOpacity style={styles.botaoPermissao} onPress={solicitarPermissao}>
          <Text style={styles.textoBotaoPermissao}>PERMITIR CÂMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoVoltarSecundario}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoVoltarSecundario}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoIcone}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>ESCANEAR QR CODE</Text>
        <TouchableOpacity
          onPress={() => setLanternaAtiva(!lanternaAtiva)}
          style={styles.botaoIcone}
        >
          <Ionicons
            name={lanternaAtiva ? 'flash' : 'flash-off'}
            size={22}
            color={lanternaAtiva ? '#fbbf24' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* VISOR DA CÂMERA */}
      <View style={styles.cameraWrapper}>
        {isFocused && (
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={lanternaAtiva}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={escaneado ? undefined : handleCodigoLido}
          />
        )}

        {/* MIRA TRANSPARENTE POR CIMA */}
        <View style={styles.overlayMira} pointerEvents="none">
          <View style={styles.quadroMira}>
            <View style={[styles.canto, styles.cantoSupEsq]} />
            <View style={[styles.canto, styles.cantoSupDir]} />
            <View style={[styles.canto, styles.cantoInfEsq]} />
            <View style={[styles.canto, styles.cantoInfDir]} />
          </View>
          <Text style={styles.instrucaoTexto}>
            Aponte a câmera para o QR Code da etiqueta do tecido
          </Text>
        </View>
      </View>

      {/* MODAL DE ENTRADA / SAÍDA DO TECIDO ENCONTRADO */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={fecharModalERetomarLeitura}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>TECIDO IDENTIFICADO</Text>
              <TouchableOpacity onPress={fecharModalERetomarLeitura}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {tecidoEncontrado && (
              <View style={styles.modalInfoProduto}>
                <Text style={styles.modalNomeProduto}>{tecidoEncontrado.nome}</Text>
                {(tecidoEncontrado.tipo || tecidoEncontrado.cor) && (
                  <Text style={styles.modalSubtituloProduto}>
                    {[tecidoEncontrado.tipo, tecidoEncontrado.cor]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                )}
                <Text style={styles.modalSaldoAtual}>
                  Estoque atual:{' '}
                  <Text style={{ fontWeight: 'bold', color: '#168bea' }}>
                    {String(tecidoEncontrado.quantidade).replace('.', ',')}{' '}
                    {tecidoEncontrado.unidade}
                  </Text>
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>TIPO DE MOVIMENTAÇÃO:</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'entrada' && {
                    backgroundColor: '#009688',
                    borderColor: '#009688'
                  }
                ]}
                onPress={() => setTipoMovimento('entrada')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'entrada' && { color: '#fff' }
                  ]}
                >
                  ENTRADA (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'saida' && {
                    backgroundColor: '#ff1744',
                    borderColor: '#ff1744'
                  }
                ]}
                onPress={() => setTipoMovimento('saida')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'saida' && { color: '#fff' }
                  ]}
                >
                  SAÍDA (-)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'ajuste do dia' && {
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b'
                  }
                ]}
                onPress={() => setTipoMovimento('ajuste do dia')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'ajuste do dia' && { color: '#fff' }
                  ]}
                >
                  AJUSTE
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>
              {tipoMovimento === 'ajuste do dia'
                ? `NOVO SALDO REAL (${tecidoEncontrado?.unidade?.toUpperCase()}):`
                : `QUANTIDADE (${tecidoEncontrado?.unidade?.toUpperCase()}):`}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 15,5"
              placeholderTextColor="#888"
              value={qtdMovimento}
              onChangeText={setQtdMovimento}
              keyboardType="numeric"
              autoFocus
            />

            <Text style={styles.modalLabel}>OBSERVAÇÃO (OPCIONAL):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Corte pedido #108, reposição..."
              placeholderTextColor="#888"
              value={observacao}
              onChangeText={setObservacao}
            />

            <TouchableOpacity
              style={[
                styles.modalBotaoConfirmar,
                tipoMovimento === 'saida' && { backgroundColor: '#ff1744' },
                tipoMovimento === 'entrada' && { backgroundColor: '#009688' },
                tipoMovimento === 'ajuste do dia' && { backgroundColor: '#f59e0b' }
              ]}
              onPress={handleConfirmarMovimentacao}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalTextoConfirmar}>CONFIRMAR MOVIMENTAÇÃO</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centroPermissao: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
  },
  containerPermissao: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  tituloPermissao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 16,
    textAlign: 'center',
  },
  textoPermissao: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  botaoPermissao: {
    backgroundColor: '#168bea',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  textoBotaoPermissao: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botaoVoltarSecundario: {
    marginTop: 16,
    padding: 8,
  },
  textoVoltarSecundario: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: 14,
    backgroundColor: '#111',
    zIndex: 10,
  },
  botaoIcone: {
    padding: 4,
  },
  headerTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayMira: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  quadroMira: {
    width: 240,
    height: 240,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  canto: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#00e5ff',
  },
  cantoSupEsq: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cantoSupDir: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cantoInfEsq: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cantoInfDir: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instrucaoTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 28,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  modalInfoProduto: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalNomeProduto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  modalSubtituloProduto: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalSaldoAtual: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tipoBotao: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tipoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  modalInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111',
    backgroundColor: '#fff',
  },
  modalBotaoConfirmar: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#168bea',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalTextoConfirmar: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});